// src/ai/ai.service.ts
import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import axios from 'axios';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { FoodLog } from '../food-log/entities/foodLog.entity';
import { Repository } from 'typeorm';
import { User } from '../users/entities/user.entity';
import { AskAiDto } from './dto/AskAiDto';
import { UserInfo } from '../food-log/entities/UserInfo';

/*
@Injectable()
export class AiService {
  /!*  private readonly apiKey = process.env.OPENAI_API_KEY;
    private readonly apiUrl = process.env.OPENAI_API_URL;*!/
  /!*  async askQuestion(prompt: string): Promise<string> {
      try {
        const response = await axios.post(
          this.apiUrl,
          {
            model: 'gpt-4', // o gpt-3.5-turbo si prefieres
            messages: [{ role: 'user', content: prompt }],
            temperature: 0.7,
          },
          {
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${this.apiKey}`,
            },
          },
        );
  
        return response.data.choices[0].message.content;
      } catch (error) {
        throw new InternalServerErrorException('Error al comunicarse con la IA');
      }
    }*!/

  private readonly apiKey: string;
  private readonly apiUrl: string;

  constructor(
    private readonly config: ConfigService,
    @InjectRepository(FoodLog)
    private readonly foodRepo: Repository<FoodLog>,
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
  ) {
    this.apiKey = this.config.get('OPENAI_API_KEY');
    this.apiUrl =
      this.config.get('OPENAI_API_URL') ??
      'https://api.openai.com/v1/chat/completions';
  }

  async askWithContext(dto: AskAiDto, userInfo: UserInfo) {
    // Trae usuario
    const user = await this.userRepo.findOne({
      where: { id: userInfo.userId },
    });
    if (!user) throw new NotFoundException('Usuario no encontrado');

    // Arma contexto con FoodLogs (hoy o por rango)
    const { includeToday = true, from, to } = dto;

    const qb = this.foodRepo
      .createQueryBuilder('f')
      .where('f.createdById = :uid', { uid: user.id })
      .orderBy('f.eatenAt', 'DESC')
      .limit(200);

    if (from && to) {
      qb.andWhere('DATE(f.eatenAt) BETWEEN :from AND :to', { from, to });
    } else if (includeToday) {
      qb.andWhere('DATE(f.eatenAt) = CURRENT_DATE()');
    }

    const logs = await qb.getMany();

    const totalKcal = logs.reduce((acc, l) => acc + (l.calories ?? 0), 0);
    const resumen = logs
      .map(
        (l) =>
          `• ${l.name} (${l.calories ?? 0} kcal) ${l.notes ? `- ${l.notes}` : ''}`,
      )
      .join('\n');

    const contextBlock = logs.length
      ? `Contexto del usuario:
- Periodo: ${from && to ? `${from} a ${to}` : includeToday ? 'Hoy' : 'Sin rango'}
- Registros: ${logs.length}
- Calorías totales aprox: ${totalKcal}
- Detalle:
${resumen}
`
      : 'Contexto del usuario: No hay comidas registradas para el periodo.';

    // 3) Llamada a OpenAI
    try {
      const response = await axios.post(
        this.apiUrl,
        {
          model: 'gpt-4', // cambia si prefieres otro
          messages: [
            {
              role: 'system',
              content:
                'Eres un coach de nutrición y fitness. Da recomendaciones claras, prácticas y seguras. Usa el contexto si existe.',
            },
            {
              role: 'user',
              content: `${contextBlock}\n\nPregunta del usuario: ${dto.prompt}`,
            },
          ],
          temperature: 0.6,
        },
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${this.apiKey}`,
          },
          timeout: 20000,
        },
      );

      return {
        answer:
          response.data.choices?.[0]?.message?.content ?? '(Sin respuesta)',
        meta: { totalKcal, logsCount: logs.length },
      };
    } catch (err) {
      // Log interno si quieres: console.error(err?.response?.data || err);
      throw new InternalServerErrorException('Error al comunicarse con la IA');
    }
  }
}*/

@Injectable()
export class AiService {
  private readonly apiKey = process.env.OPENAI_API_KEY;
  private readonly apiUrl = process.env.OPENAI_API_URL;

  async askQuestion(prompt: string): Promise<string> {
    try {
      const response = await axios.post(
        this.apiUrl,
        {
          model: 'openai/gpt-4o-mini', // Modelo de OpenRouter (puedes cambiarlo)
          messages: [{ role: 'user', content: prompt }],
          temperature: 0.7,
        },
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${this.apiKey}`,
          },
        },
      );

      return response.data.choices[0].message.content;
    } catch (error) {
      console.error(error.response?.data || error.message);
      throw new InternalServerErrorException('Error al comunicarse con la IA');
    }
  }
}