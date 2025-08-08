// src/ai/ai.service.ts
import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import axios from 'axios';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { FoodLog } from '../food-log/entities/foodLog.entity';
import { Repository } from 'typeorm';
import { User } from '../users/entities/user.entity';
import { AskAiDto } from './dto/AskAiDto';
import { UserInfo } from '../food-log/entities/UserInfo';

import { addHours, setHours, setMinutes, setSeconds } from 'date-fns'; // opcional

type Provider = 'openai' | 'openrouter';

@Injectable()
export class AiService {
  private readonly apiKey: string;
  private readonly apiUrl: string;
  private readonly provider: Provider;

  constructor(
    private readonly config: ConfigService,
    @InjectRepository(FoodLog) private readonly foodRepo: Repository<FoodLog>,
    @InjectRepository(User) private readonly userRepo: Repository<User>,
  ) {
    this.provider =
      (this.config.get<string>('AI_PROVIDER') as Provider) ?? 'openai';

    // Defaults seguros
    const defaultUrl =
      this.provider === 'openrouter'
        ? 'https://openrouter.ai/api/v1/chat/completions'
        : 'https://api.openai.com/v1/chat/completions';

    this.apiUrl = this.config.get<string>('OPENAI_API_URL') ?? defaultUrl;
    this.apiKey = this.config.get<string>('OPENAI_API_KEY') ?? '';

    if (!this.apiUrl) {
      throw new BadRequestException(
        'Falta configurar OPENAI_API_URL o AI_PROVIDER',
      );
    }
    if (!this.apiKey) {
      throw new BadRequestException('Falta configurar OPENAI_API_KEY');
    }
  }

  private get model(): string {
    return this.provider === 'openrouter' ? 'openai/gpt-4o-mini' : 'gpt-4o-mini';
  }

  private get headers() {
    const isOpenRouter = this.provider === 'openrouter';
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${this.apiKey}`,
    };

    if (isOpenRouter) {
      headers['HTTP-Referer'] = this.config.get<string>('APP_URL') ?? 'http://localhost:3000';
      headers['X-Title'] = this.config.get<string>('APP_NAME') ?? 'NestJS Health Coach';
    }
    return headers;
  }

  async askQuestion(prompt: string): Promise<string> {
    try {
      const { data } = await axios.post(
        this.apiUrl,
        {
          model: this.model,
          messages: [
            { role: 'system', content: 'Eres un coach de nutrición. Sé breve y concreto.' },
            { role: 'user', content: prompt },
          ],
          temperature: 0.6,
          max_tokens: 220,
        },
        { headers: this.headers, timeout: 20000 },
      );
      return data.choices?.[0]?.message?.content ?? '(Sin respuesta)';
    } catch (err: any) {
      if (process.env.NODE_ENV !== 'production') {
        console.error('[AI] Request failed:', {
          status: err?.response?.status,
          data: err?.response?.data,
          message: err?.message,
        });
      }
      throw new InternalServerErrorException('Error al comunicarse con la IA');
    }
  }

  async askWithContext(dto: AskAiDto, userInfo: UserInfo) {
    // 1) Usuario
    const user = await this.userRepo.findOne({
      where: { id: userInfo.userId },
    });
    if (!user) {
      throw new NotFoundException('Usuario no encontrado');
    }

    // 2) Logs
    const { includeToday = true, from, to } = dto;

    const qb = this.foodRepo
      .createQueryBuilder('f')
      .select(['f.name', 'f.calories', 'f.notes', 'f.eatenAt'])
      .where('f.createdById = :uid', { uid: user.id })
      .orderBy('f.eatenAt', 'DESC')
      .limit(60);

    if (from && to) {
      qb.andWhere('DATE(f.eatenAt) BETWEEN :from AND :to', { from, to });
    } else if (includeToday) {
      qb.andWhere('DATE(f.eatenAt) = CURRENT_DATE()');
    }

    const logs = await qb.getMany();
    const totalKcal = logs.reduce((acc, l) => acc + (l.calories ?? 0), 0);
    const resumen =
      logs
        .map(
          (l) =>
            `${l.name}(${l.calories ?? 0}kcal)${l.notes ? `- ${l.notes}` : ''}`,
        )
        .join('; ')
        .slice(0, 3000) || 'Sin registros en el periodo';

    const periodo =
      from && to ? `${from} a ${to}` : includeToday ? 'Hoy' : 'Recientes';

    const systemPrompt =
      'Eres un coach de nutrición y fitness. Da respuestas cortas, accionables y seguras. Enfatiza hábitos sostenibles.';
    const userPrompt =
      `Periodo: ${periodo}\n` +
      `Total aprox kcal: ${totalKcal}\n` +
      `Logs: ${resumen}\n\n` +
      `Pregunta: ${dto.prompt}`;

    // 3) Llamada IA
    try {
      const { data } = await axios.post(
        this.apiUrl,
        {
          model: this.model,
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt },
          ],
          temperature: 0.6,
          max_tokens: 220,
        },
        {
          headers: this.headers,
          timeout: 20000,
        },
      );

      return {
        answer: data.choices?.[0]?.message?.content ?? '(Sin respuesta)',
        meta: { totalKcal, logsCount: logs.length, periodo },
      };
    } catch (err: any) {
      // console.error('AI error:', err.response?.data || err.message);
      throw new InternalServerErrorException('Error al comunicarse con la IA');
    }
  }

  /**
   * Pide a la IA un resumen SOLO del almuerzo de HOY.
   * Ventana horaria: 11:00 - 16:00 hora del servidor (ajusta si usas otra TZ).
   */
  async askLunchSummary(userInfo: UserInfo, userPrompt?: string) {
    // 1) Usuario
    const user = await this.userRepo.findOne({ where: { id: userInfo.userId } });
    if (!user) throw new NotFoundException('Usuario no encontrado');

    // 2) Ventana "almuerzo de hoy" (11:00–16:00). Ajusta si tu horario es otro.
    const now = new Date();
    const start = setSeconds(setMinutes(setHours(now, 11), 0), 0);
    const end   = setSeconds(setMinutes(setHours(now, 18), 0), 0);

    // 3) Traer solo campos necesarios
    const rows = await this.foodRepo.createQueryBuilder('f')
      .select(['f.name', 'f.protein', 'f.calories', 'f.eatenAt'])
      .where('f.createdById = :uid', { uid: user.id })
      .andWhere('f.eatenAt BETWEEN :from AND :to', { from: start, to: end })
      .orderBy('f.eatenAt', 'ASC')
      .limit(40)
      .getMany();

    const items = rows.map(r => ({
      name: r.name,
      protein: Number(r['protein'] ?? 0),
      calories: Number(r['calories'] ?? 0),
      eatenAt: r.eatenAt,
    }));

    const totalProtein = items.reduce((a, i) => a + (i.protein || 0), 0);

    // 4) Armar contexto compacto para la IA
    //    Formato fácil de parsear (líneas), sin exceder ~3000 chars
    const context =
      items.map(i => `${i.name} | protein:${i.protein}g | kcal:${i.calories}`).join('\n')
        .slice(0, 3000) || 'SIN_DATOS';

    const systemPrompt =
      'Eres un coach de nutrición. Responde en español, breve, con viñetas. ' +
      'Tarea: listar SOLO el almuerzo de hoy (11:00–16:00) con proteína por ítem y el total de proteína. ' +
      'Si no hay datos, di: "No registraste almuerzo hoy". No inventes valores.';

    const userMsg =
      (userPrompt && userPrompt.trim().length > 0)
        ? userPrompt
        : 'Hoy que almorcé. Lista cada comida con su proteína (g) y un total al final.';

    const finalUserContent =
      `Contexto (uno por línea):\n${context}\n\nPregunta: ${userMsg}`;

    // 5) Llamada a OpenRouter / OpenAI
    try {
      const { data } = await axios.post(
        this.apiUrl,
        {
          model: this.model, // openrouter -> "openai/gpt-4o-mini"
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: finalUserContent },
          ],
          temperature: 0.3,
          max_tokens: 220,
        },
        { headers: this.headers, timeout: 20000 },
      );

      return {
        answer: data.choices?.[0]?.message?.content ?? '(Sin respuesta)',
        meta: {
          items: items.length,
          totalProtein,
          window: { start, end },
        },
      };
    } catch (err: any) {
      if (process.env.NODE_ENV !== 'production') {
        console.error('[AI] LunchSummary failed:', {
          status: err?.response?.status,
          data: err?.response?.data,
          message: err?.message,
        });
      }
      throw new InternalServerErrorException('Error al comunicarse con la IA');
    }
  }
}


