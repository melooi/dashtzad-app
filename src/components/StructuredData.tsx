// Renders a JSON-LD <script> block. Pass any schema.org object (or array).
export function StructuredData({ data }: { data: object | object[] }) {
  return (
    <script
      type="application/ld+json"
      // JSON.stringify output is safe here: it is our own server-built data.
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
