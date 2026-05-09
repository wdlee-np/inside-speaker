// json-ld.tsx — 구조화 데이터 렌더링 헬퍼 (서버 컴포넌트)
// JSON-LD를 <script type="application/ld+json"> 태그로 렌더링한다.

interface JsonLdProps {
  data: Record<string, unknown> | Record<string, unknown>[];
}

/**
 * Schema.org 구조화 데이터를 렌더링하는 서버 컴포넌트.
 * XSS 위험이 있는 사용자 입력이 아닌 서버 데이터만 전달할 것.
 */
export function JsonLd({ data }: JsonLdProps) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
