This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## URLS to use with the code:

http://localhost:3000/api/module?studiengangId=37

Die oben genannte url zeigt alle module und dessen infos vom Studiengang "Maschinenbau Bc." (ersetzt man die 37 mit 83, so kommen alle Module des Studiengangs Maschinenbau Ms).

http://localhost:3000/api/bereichregel?studiengangId=37

Die zweite URL zeigt die Bereichsregeln (wie viele min/max LP oder wie viele Module erreiht werden müssen) des jeweiligen Modulbereichs des Studiengangs Maschinenbau Bc (83 mit 37 ersetzen, wenn für Maschinenbau Ms).

Sry dass ich das so unordentlich in die readme packe, ich muss jetzt los bis 23 arbeiten lol




## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
