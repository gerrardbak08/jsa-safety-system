import { NextResponse } from 'next/server'

export const runtime = 'nodejs'

// CoolSMS API 연동
// 환경변수: COOLSMS_API_KEY, COOLSMS_API_SECRET, COOLSMS_SENDER (발신번호)
// 관리자 번호: ADMIN_PHONE_NUMBERS (쉼표로 구분, 예: "01012345678,01098765432")

export async function POST(req: Request) {
    try {
        const body = await req.json()
        const { 작업명, 매장명, 작성자, 위험등급 } = body

        const apiKey = process.env.COOLSMS_API_KEY
        const apiSecret = process.env.COOLSMS_API_SECRET
        const sender = process.env.COOLSMS_SENDER
        const adminNumbers = process.env.ADMIN_PHONE_NUMBERS

        if (!apiKey || !apiSecret || !sender || !adminNumbers) {
            return NextResponse.json({
                success: false,
                error: 'CoolSMS 환경변수가 설정되지 않았습니다.',
                required: ['COOLSMS_API_KEY', 'COOLSMS_API_SECRET', 'COOLSMS_SENDER', 'ADMIN_PHONE_NUMBERS'],
            }, { status: 200 }) // 500 대신 200 반환하여 JSA 저장은 계속 진행
        }

        // 위험등급 이모지
        const gradeEmoji = 위험등급 === '상' ? '🔴' : 위험등급 === '중' ? '🟡' : '🟢'

        const messageText = `[JSA 위험성평가 제출]
${gradeEmoji} 위험등급: ${위험등급 || '미분류'}
📍 매장: ${매장명}
🔧 작업: ${작업명}
👤 작성자: ${작성자}
⏰ ${new Date().toLocaleString('ko-KR', { timeZone: 'Asia/Seoul' })}

JSA Safety System`

        const targets = adminNumbers.split(',').map(n => n.trim()).filter(Boolean)

        // CoolSMS REST API 직접 호출 (SDK 의존성 최소화)
        const timestamp = String(Date.now())
        const crypto = await import('crypto')
        const signature = crypto
            .createHmac('sha256', apiSecret)
            .update(timestamp + apiKey)
            .digest('hex')

        const results = await Promise.allSettled(
            targets.map(async (to) => {
                const res = await fetch('https://api.solapi.co.kr/messages/v4/send', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `HMAC-SHA256 apiKey=${apiKey}, date=${timestamp}, salt=${timestamp}, signature=${signature}`,
                    },
                    body: JSON.stringify({
                        message: {
                            to,
                            from: sender,
                            text: messageText,
                            type: 'SMS',
                        },
                    }),
                })
                return res.json()
            })
        )

        return NextResponse.json({
            success: true,
            results: results.map((r, i) => ({
                to: targets[i],
                status: r.status,
            })),
        })
    } catch (error) {
        console.error('SMS send error:', error)
        // SMS 실패해도 JSA 저장에 영향 없도록 200 반환
        return NextResponse.json({ success: false, error: String(error) }, { status: 200 })
    }
}
