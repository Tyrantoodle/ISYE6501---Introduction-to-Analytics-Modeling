# ISYE 6501 · Midterm 1 study apps

Four static tools for Modules 1–10: a searchable guide, five practice quizzes, 554 flashcards, and searchable learning resources.

[Course site](https://tyrantoodle.github.io/ISYE6501---Introduction-to-Analytics-Modeling/)

```text
index.html                         Pages entry
Exams/Midterm - 1/apps/
├── index.html                     Study hub
├── guide/index.html               Complete guide and section search
├── quizzes/
│   ├── index.html
│   ├── app.js
│   ├── core.js
│   ├── questions.js               Questions only
│   └── answers.js                 Separate key, loaded after submission
├── flashcards/
│   ├── index.html
│   ├── app.js
│   ├── data.js
│   └── styles.css
├── resources/index.html           Readings, videos, patterns, and coverage
└── shared/
    ├── reader.js
    └── styles.css
```

Open the root `index.html` locally, or serve the repository with `python3 -m http.server 8000 --bind 127.0.0.1`. No packages, backend, or account are required. External reading/video links require internet. The guide and resources remain readable with JavaScript disabled.

Quizzes save drafts per quiz when browser storage is available. Submit before reviewing explanations; blanks are self-checked for equivalent wording/formulas. **Print questions** prints the question view without the answer review or your responses. Flashcards retain Reveal, Previous, Next, and Auto-play at 5/10/15 seconds.

Git contains only this documentation, root Pages/configuration files, and the `apps` tree. The separate `cheat-sheet`, source `materials`, authoring tools, supplied PDFs, course transcripts, and browser environments stay local in the course workspace. There are no duplicate guide/resource payloads or printable quiz copies in the published tree.

The repository-root Pages entry opens the app hub using a relative project URL. Keep the folder structure intact and retain root `.nojekyll`. This local restructure has not been committed, pushed, or deployed. Logic and asset checks pass; real-browser layout and live deployment verification remain pending.
