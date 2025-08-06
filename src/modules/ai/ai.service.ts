// src/ai/ai.service.ts
import { Injectable, InternalServerErrorException } from '@nestjs/common';
import axios from 'axios';

@Injectable()
export class AiService {
  private readonly apiKey = process.env.OPENAI_API_KEY;
  private readonly apiUrl = process.env.OPENAI_API_URL;

  async askQuestion(prompt: string): Promise<string> {
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
  }
}
