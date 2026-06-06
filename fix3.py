content = open('app/account/page.tsx').read()
content = content.replace(
    '\nexport const dynamic = \'force-dynamic\';\n"use client";',
    '"use client";\nexport const dynamic = \'force-dynamic\';'
)
open('app/account/page.tsx', 'w').write(content)
print('Done!')
