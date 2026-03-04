import { NextRequest, NextResponse } from 'next/server'
import { GoogleGenerativeAI } from '@google/generative-ai'
import { createClient } from '@supabase/supabase-js'

export const runtime = 'nodejs'

export async function POST(req: NextRequest) {
    // Create clients inside the function - NOT at module level
    const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!)

    try {
        const formData = await req.formData()
        const imageFile = formData.get('image') as File | null
        const 작업명 = formData.get('작업명') as string
        const 작업내용 = formData.get('작업내용') as string
        const 매장명 = formData.get('매장명') as string

        let imageUrl = ''
        let analysisResult = ''

        if (imageFile) {
            const fileName = `jsa-${Date.now()}-${imageFile.name.replace(/[^a-zA-Z0-9.]/g, '_')}`
            const buffer = await imageFile.arrayBuffer()
            const uint8Array = new Uint8Array(buffer)

            const { error: uploadError } = await supabase.storage
                .from('jsa-images')
                .upload(fileName, uint8Array, { contentType: imageFile.type, upsert: false })

            if (!uploadError) {
                const { data: publicUrlData } = supabase.storage.from('jsa-images').getPublicUrl(fileName)
                imageUrl = publicUrlData.publicUrl
            }

            try {
                const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' })
                const imageData = {
                    inlineData: {
                        data: Buffer.from(buffer).toString('base64'),
                        mimeType: imageFile.type,
                    },
                }
                const prompt = `당신은 산업안전보건 전문가입니다. 아래 작업 현장 이미지를 분석하여 위험요인을 평가해주세요.
작업명: ${작업명 || '미입력'}
매장명: ${매장명 || '미입력'}
작업내용: ${작업내용 || '미입력'}

다음 형식으로 분석 결과를 JSON으로 답해주세요:
{"위험등급":"상/중/하 중 하나","위험점수":0~100,"유해위험요인":"위험요인 설명","유형":"감전/전도/끼임/넘어짐/떨어짐/베임/기타","개선대책":"안전조치 및 개선방안","ai_분석결과":"전반적인 안전 분석 요약"}`
                const result = await model.generateContent([prompt, imageData])
                const responseText = result.response.text()
                const jsonMatch = responseText.match(/\{[\s\S]*\}/)
                analysisResult = jsonMatch ? jsonMatch[0] : JSON.stringify({ ai_분석결과: responseText })
            } catch {
                analysisResult = JSON.stringify({ ai_분석결과: 'AI 분석 중 오류가 발생했습니다.' })
            }
        } else {
            try {
                const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' })
                const prompt = `당신은 산업안전보건 전문가입니다. 다음 작업 정보를 바탕으로 위험요인을 분석해주세요.
작업명: ${작업명 || '미입력'}
매장명: ${매장명 || '미입력'}
작업내용: ${작업내용 || '미입력'}

다음 형식으로 분석 결과를 JSON으로 답해주세요:
{"위험등급":"상/중/하 중 하나","위험점수":0~100,"유해위험요인":"예상되는 위험요인","유형":"감전/전도/끼임/넘어짐/떨어짐/베임/기타","개선대책":"안전조치 및 개선방안","ai_분석결과":"전반적인 안전 분석 요약"}`
                const result = await model.generateContent(prompt)
                const responseText = result.response.text()
                const jsonMatch = responseText.match(/\{[\s\S]*\}/)
                analysisResult = jsonMatch ? jsonMatch[0] : JSON.stringify({ ai_분석결과: responseText })
            } catch {
                analysisResult = JSON.stringify({ ai_분석결과: 'AI 분석 중 오류가 발생했습니다.' })
            }
        }

        return NextResponse.json({
            imageUrl,
            analysis: JSON.parse(analysisResult),
        })
    } catch (error) {
        console.error('Analyze route error:', error)
        return NextResponse.json({ error: 'Analysis failed' }, { status: 500 })
    }
}
