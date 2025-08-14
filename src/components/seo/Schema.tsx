import type { SchemaOrg } from '@/types/seo'

interface SchemaProps {
  schema: SchemaOrg | SchemaOrg[]
}

export function Schema({ schema }: SchemaProps) {
  const schemas = Array.isArray(schema) ? schema : [schema]

  return (
    <>
      {schemas.map((schemaItem, index) => (
        <script 
          key={index}
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(schemaItem, null, 0)
          }}
        />
      ))}
    </>
  )
}
