import { NextRequest, NextResponse } from 'next/server'
import { GoogleGenerativeAI } from '@google/generative-ai'
import { getSupabase } from '@/lib/supabase'

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '')

interface MaskResult {
  original_japanese: string
  original_reading: string
  particle: string
  masked_japanese: string
  masked_reading: string
}

export async function POST(request: NextRequest) {
  try {
    const { japanese, reading, particle } = await request.json()

    if (!japanese || !reading || !particle) {
      return NextResponse.json(
        { error: 'japanese, reading, particle are required' },
        { status: 400 }
      )
    }

    const supabase = getSupabase()

    // 캐시 확인
    const { data: cached } = await supabase
      .from('particle_quiz_cache')
      .select('*')
      .eq('original_japanese', japanese)
      .eq('particle', particle)
      .single()

    if (cached) {
      return NextResponse.json({
        masked_japanese: cached.masked_japanese,
        masked_reading: cached.masked_reading,
        fromCache: true,
      })
    }

    // Gemini로 마스킹 처리
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' })

    const prompt = `다음 일본어 문장에서 조사 "${particle}"의 위치를 찾아서 해당 부분을 "___"로 마스킹해주세요.

일본어 원문: ${japanese}
읽기(히라가나): ${reading}
마스킹할 조사: ${particle}

규칙:
1. 조사가 여러 번 나오면 첫 번째 것만 마스킹
2. 일본어와 읽기 모두에서 같은 위치의 조사를 마스킹
3. 조사와 붙어있는 글자는 그대로 두고 조사만 "___"로 대체

JSON 형식으로만 응답해주세요:
{
  "masked_japanese": "마스킹된 일본어",
  "masked_reading": "마스킹된 읽기"
}

예시:
- 입력: "私は学校に行きます", "わたしはがっこうにいきます", "は"
- 출력: {"masked_japanese": "私___学校に行きます", "masked_reading": "わたし___がっこうにいきます"}`

    const result = await model.generateContent(prompt)
    const response = result.response
    const text = response.text()

    // JSON 파싱
    const jsonMatch = text.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      throw new Error('Failed to parse AI response')
    }

    const parsed = JSON.parse(jsonMatch[0])
    const maskedJapanese = parsed.masked_japanese
    const maskedReading = parsed.masked_reading

    // Supabase에 캐시 저장
    await supabase.from('particle_quiz_cache').insert({
      original_japanese: japanese,
      original_reading: reading,
      particle,
      masked_japanese: maskedJapanese,
      masked_reading: maskedReading,
    })

    return NextResponse.json({
      masked_japanese: maskedJapanese,
      masked_reading: maskedReading,
      fromCache: false,
    })
  } catch (error) {
    console.error('Particle mask error:', error)
    return NextResponse.json(
      { error: 'Failed to mask particle' },
      { status: 500 }
    )
  }
}
