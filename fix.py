content = open('app/account/page.tsx').read()
old = 'import { createClient } from "@/supabase/client";'
new = 'import { useRouter, useSearchParams } from "next/navigation";\nimport { createClient } from "@/supabase/client";'
content = content.replace(old, new)
open('app/account/page.tsx', 'w').write(content)
print('Done!')
