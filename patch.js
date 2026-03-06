const fs = require('fs');
const file = 'app/jsa/new/page.tsx';
let txt = fs.readFileSync(file, 'utf8');

// 1. replace interface
txt = txt.replace(/interface WorkStep \{\s+단계번호: number\s+작업내용: string\s+\/\/ 조치 전 사진 \(분석용\)\s+이미지파일\?: File\s+이미지미리보기\?: string\s+이미지URL\?: string\s+\/\/ 조치 후 사진\s+조치후이미지파일\?: File\s+조치후이미지미리보기\?: string\s+조치후이미지URL\?: string\s+분석중: boolean\s+분석결과\?: \{[\s\S]*?\}\s+\}/,
    `interface WorkStep {
    단계번호: number
    작업내용: string
    // 조치 전
    이미지파일?: File
    이미지미리보기?: string
    이미지URL?: string
    조치전위험등급?: string
    유해위험요인?: string
    // 조치 후
    조치후이미지파일?: File
    조치후이미지미리보기?: string
    조치후이미지URL?: string
    조치후위험등급?: string
    개선대책?: string
    예산사용내역?: string
    조치완료일자?: string
    분석중: boolean
    분석결과?: {
        위험등급?: string
        위험점수?: number
        유해위험요인?: string
        유형?: string
        개선대책?: string
        ai_분석결과?: string
    }
}`);

// 2. replace payload
txt = txt.replace(/유해위험요인: step\.분석결과\?\.유해위험요인 \|\| null,\s+위험등급: step\.분석결과\?\.위험등급 \|\| null,\s+유형: step\.분석결과\?\.유형 \|\| null,\s+개선대책: step\.분석결과\?\.개선대책 \|\| null,/,
    `유해위험요인: step.유해위험요인 || step.분석결과?.유해위험요인 || null,
                    위험등급: step.조치전위험등급 || step.분석결과?.위험등급 || null,
                    조치전위험등급: step.조치전위험등급 || step.분석결과?.위험등급 || null,
                    조치후위험등급: step.조치후위험등급 || null,
                    예산사용내역: step.예산사용내역 || null,
                    개선조치완료일자: step.조치완료일자 || null,
                    유형: step.분석결과?.유형 || null,
                    개선대책: step.개선대책 || step.분석결과?.개선대책 || null,`);

// 3. UI inject after 조치 전 사진 block
txt = txt.replace(/<\/div>\s+\{\/\* ── 조치 후 사진 ── \*\/\}/,
    `</div>
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '0.5rem', marginTop: '0.75rem' }}>
                                        <div className="form-group" style={{ marginBottom: 0 }}>
                                            <label className="form-label" style={{ fontSize: '0.7rem' }}>위험등급</label>
                                            <select
                                                className="form-input"
                                                style={{ fontSize: '0.8rem', padding: '0.5rem' }}
                                                value={step.조치전위험등급 ?? step.분석결과?.위험등급 ?? ''}
                                                onChange={e => updateStep(idx, { 조치전위험등급: e.target.value })}
                                            >
                                                <option value="">선택</option>
                                                <option value="상">상</option>
                                                <option value="중">중</option>
                                                <option value="하">하</option>
                                            </select>
                                        </div>
                                        <div className="form-group" style={{ marginBottom: 0 }}>
                                            <label className="form-label" style={{ fontSize: '0.7rem' }}>유해위험요인</label>
                                            <textarea
                                                className="form-input"
                                                style={{ fontSize: '0.8rem', padding: '0.5rem', minHeight: '38px', resize: 'none' }}
                                                value={step.유해위험요인 ?? step.분석결과?.유해위험요인 ?? ''}
                                                onChange={e => updateStep(idx, { 유해위험요인: e.target.value })}
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* ── 조치 후 사진 ── */}`);

// 4. UI inject after 조치 후 사진 block
txt = txt.replace(/<div onClick=\{\(\) => fileInputAfterRefs\.current\[idx\]\?\.click\(\)\} style=\{\{ height: '60px'[^\}]+\}\}>사진 없음 \(클릭하여 추가\)<\/div>\s+\}\)\}\s+<\/div>\s+\{\/\* AI 분석 버튼 \*\/\}/,
    `<div onClick={() => fileInputAfterRefs.current[idx]?.click()} style={{ height: '60px', border: '1px dashed #34d39944', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#64748b', fontSize: '0.72rem' }}>사진 없음 (클릭하여 추가)</div>
                                    )}
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '0.5rem', marginTop: '0.75rem' }}>
                                        <div className="form-group" style={{ marginBottom: 0 }}>
                                            <label className="form-label" style={{ fontSize: '0.7rem' }}>조치 후 위험등급</label>
                                            <select
                                                className="form-input"
                                                style={{ fontSize: '0.8rem', padding: '0.5rem' }}
                                                value={step.조치후위험등급 ?? ''}
                                                onChange={e => updateStep(idx, { 조치후위험등급: e.target.value })}
                                            >
                                                <option value="">선택</option>
                                                <option value="상">상</option>
                                                <option value="중">중</option>
                                                <option value="하">하</option>
                                            </select>
                                        </div>
                                        <div className="form-group" style={{ marginBottom: 0 }}>
                                            <label className="form-label" style={{ fontSize: '0.7rem' }}>개선대책</label>
                                            <textarea
                                                className="form-input"
                                                style={{ fontSize: '0.8rem', padding: '0.5rem', minHeight: '38px', resize: 'none' }}
                                                value={step.개선대책 ?? step.분석결과?.개선대책 ?? ''}
                                                onChange={e => updateStep(idx, { 개선대책: e.target.value })}
                                            />
                                        </div>
                                        <div className="form-group" style={{ marginBottom: 0 }}>
                                            <label className="form-label" style={{ fontSize: '0.7rem' }}>예산사용내역</label>
                                            <input
                                                type="text"
                                                className="form-input"
                                                placeholder="예: 수리비 5만원"
                                                style={{ fontSize: '0.8rem', padding: '0.5rem' }}
                                                value={step.예산사용내역 ?? ''}
                                                onChange={e => updateStep(idx, { 예산사용내역: e.target.value })}
                                            />
                                        </div>
                                        <div className="form-group" style={{ marginBottom: 0 }}>
                                            <label className="form-label" style={{ fontSize: '0.7rem' }}>완료일자</label>
                                            <input
                                                type="date"
                                                className="form-input"
                                                style={{ fontSize: '0.8rem', padding: '0.5rem' }}
                                                value={step.조치완료일자 ?? ''}
                                                onChange={e => updateStep(idx, { 조치완료일자: e.target.value })}
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* AI 분석 버튼 */}`);

// 5. Remove manual override inputs
txt = txt.replace(/\{\/\* Manual override inputs \*\/\}[\s\S]*?<\/div>\s*<\/div>\s*<\/div>\s*\)\}\s*<\/div>/,
    `                                        </div>
                                    </div>
                                )}
                            </div>`);

fs.writeFileSync(file, txt);
console.log('Patch complete!');
