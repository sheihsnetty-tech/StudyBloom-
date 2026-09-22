# StudyBloom

A general student academic planner based on the StudyBloom planner PDF.

## Included
- Student onboarding
- Dashboard
- Semester, monthly, weekly and daily planning
- Assignment/project tracker
- Exam/assessment tracker
- Revision planner
- Study-session planner
- Grade tracker
- Habit tracker
- Notes/brain dump
- StudyBloom AI
- Settings/profile
- Browser local storage for planner data

## Run locally

```bash
npm install
npm run dev
```

Open http://localhost:3000

## StudyBloom Smart Tutor

The built-in Smart Tutor works without an API key. It uses lightweight on-device/browser logic for common study-help prompts, so there is no paid AI API required.

## Deploy to Vercel

1. Upload this project to a GitHub repository.
2. Import the repository into Vercel.
3. Add `OPENAI_API_KEY` and optionally `OPENAI_MODEL` as Environment Variables.
4. Deploy.

The app works without the AI key; only the AI feature needs the server key.
