# StructTutor: Everything I Would Change

A plain-English report for a non-coder. Based on a review of the uploaded project (untitled.zip), 29 October 2026.

## 1. How to read this report

**What I checked.** I read the file list, the READMEs, your master build prompt, the screenshots saved inside the project, the colour and styling file, the structure of the main web screen, the question and syllabus data, the maths solvers and the launcher scripts. I ran the Python test suite (62 tests, all passed in under a second).

**What I could not check.** I did not open either app live, so I have not felt it respond to clicks. I could not open the Python desktop window (it needs a Windows graphics library that is not available here). I did not read every one of the roughly 2,100 lines in the main web screen file. I did not check whether the engineering numbers and Eurocode content are correct. That needs a qualified engineer, which in practice means you, and your own build prompt already says this.

**How each item is laid out.** Every item has four parts: what it is, why it matters, what I would change, and a rough size of job. Sizes are rough guesses: *small* is under an hour or two, *medium* is a day or so, *large* is several days.

**Priority.** *Must* means fix before you add content. *Should* means fix soon. *Nice* means polish when there is time.

## 2. The short version

The look and feel is genuinely good. It reads as a calm, serious engineering tool. What is holding it back falls into three groups.

1. **Prototype leftovers showing on screen.** A developer button floats over every page, the dashboard shows fake progress, the browser tab still says "Audit Workbench", and internal project jargon is visible to the learner.
2. **Weak foundations for adding content.** Progress is not saved in the web app, the questions are written into the program code rather than kept as separate content files, there are two apps each with its own copy of the curriculum, and about 29% of the web code is dead leftovers from an earlier version.
3. **Housekeeping.** Confusing launch files, duplicate copies of the same file, unused software packages, boilerplate documentation that no longer matches the project, and very few tests on the web side.

None of this is a disaster. It is what a one-day prototype normally looks like. Most of it can be cleaned up in a few days, and doing so first will make the content phase much smoother.

## 3. Part A: Things that spoil the first impression

### A1. A developer button floats over every screen

**What it is.** In the bottom right corner of every page there is a green button reading "Verify Reconstruction (12/12)". It opens a self-check panel that tests the app's own calculations.

**Why it matters.** It is a tool for the person building the app, not the person learning from it. It sits on top of content (in the screenshots it covers the bottom of the dashboard and the learning map). The word "Reconstruction" means nothing to a learner. It makes the app feel unfinished.

**What I would change.** Hide it behind a developer switch, or move it to a Settings or Diagnostics page. Keep the feature, because self-checking is useful, but out of sight.

**Priority and size.** Must. Small.

### A2. The dashboard shows progress you have not earned

**What it is.** On a brand-new install the dashboard already shows a 45% progress ring, bars such as "1/3" and "2/5 Needs Review", and a Recent Learning Sessions list with dates ("Today, 2:15 PM", "Yesterday, 6:40 PM"). The code confirms the recent sessions come from a fixed list written into the program, and the other figures appear to be seeded the same way.

**Why it matters.** It is like opening a new fitness app and finding a month of workouts already logged. It makes the numbers untrustworthy. For a tutor whose whole purpose is to find out what you do not know, fake mastery is actively harmful.

**What I would change.** Start every figure at zero or "not started". Build a proper first-run (empty) state: a welcoming message, a clear "Start your first lesson" button, and empty progress bars. Keep the fake data only as a clearly named demo mode if you want screenshots.

**Priority and size.** Must. Medium (it ties in with saving progress, see B1).

### A3. The XP counter

**What it is.** The header shows "1,240 XP" with a flame icon, and answers award 25 or 50 points. The number starts at 1,240 in the code.

**Why it matters.** Your own build prompt says to avoid "meaningless gamification". Points for answering questions are exactly that, unless they mean something. A professional engineer studying for competence is unlikely to be motivated by a flame icon, and a made-up starting number makes it worse.

**What I would change.** Either remove it, or replace it with something that carries real information, such as "days studied this week", "objectives secure" or "questions answered first time". I would lean towards removing it.

**Priority and size.** Should. Small.

### A4. Emoji mixed with proper icons

**What it is.** The interface uses clean line icons in some places and colourful emoji in others: 📖 Learn, 🏁 Summary, 🎯 Up Next, ✅ Mastered, 🔒 Locked, ⚠️ Needs Review, ⏱ and 📝 on the dashboard.

**Why it matters.** Emoji look different on every device, clash with the restrained dark and white palette, and make a serious tool look casual. Mixing two icon styles is one of the quickest ways an interface looks "home-made".

**What I would change.** Replace every emoji with an icon from the line-icon set the app already uses (lucide). Keep the badge wording (Locked, Mastered and so on) so meaning does not depend on colour or icon alone.

**Priority and size.** Should. Small.

### A5. Internal project jargon visible to the learner

**What it is.** Screens contain phrases like "Year 1 Mastery & Milestone A Portfolio Tracker", "Unlocks Milestone A Credit", "Verify Reconstruction", "First-Try Mastery Eligible" and "Stage 1: Core Mechanics". "Milestone A" and "Phase 2" are names of build steps from the making of the app.

**Why it matters.** A learner should never see the scaffolding. These labels also read as if the app is grading you against a hidden scheme.

**What I would change.** Go through every visible label and rewrite it in plain learner language: "Your progress this year", "Next up", "Answered correctly first time". Put the wording in one place so it is easy to change.

**Priority and size.** Should. Small to medium.

### A6. The tutor page header is four rows tall

**What it is.** Above the actual question there are four stacked bars: Exit and breadcrumb, then Units Reference / Calculator / XP, then the step pills (1a, 1b, 2a and so on), then the progress bar.

**Why it matters.** On a typical laptop the question appears about a third of the way down the page and the beam diagram falls below the fold, so you scroll to see the thing you are being asked about. This was also the density problem you felt in the first versions, in a milder form.

**What I would change.** Merge it into one or two rows. Breadcrumb, step pills and progress can share a line. Move the tools (units reference, calculator) to small icons on the right. Aim for the question and diagram being visible without scrolling at laptop size.

**Priority and size.** Should. Medium.

### A7. Repeated "Details / Syllabus Info" buttons

**What it is.** On the Learning Map, every objective has its own Details / Syllabus Info button as well as a Practice button, and each module has another.

**Why it matters.** Repetition adds noise. When every row has the same extra button, the eye stops seeing it and the page looks busier than it is.

**What I would change.** One details control per module, or make the whole row clickable. Keep only one clear button (Practice) on each objective.

**Priority and size.** Nice. Small.

### A8. False precision in numbers

**What it is.** The sample question shows a section modulus of 666,666.7 mm³. That is a calculation result from a 100 mm by 200 mm style rectangle, printed to seven digits.

**Why it matters.** Engineers notice this immediately. It suggests a precision the input data does not have, and it is harder to read than 667 × 10³ mm³ or 667 cm³. A tool for practising engineers should model good habits.

**What I would change.** Round displayed values to sensible significant figures (usually three or four), and choose standard engineering units and notation, such as cm³ or × 10³ mm³ for section modulus. Keep the full-precision value behind the scenes for checking answers.

**Priority and size.** Should. Small to medium (needs a single rule applied everywhere).

### A9. The browser tab and share details still describe the old audit page

**What it is.** The page title, description and social-sharing tags say "StructTutor Phase 2 Audit & Practice Workbench ... 44-test verification suite". That was the first version of the web app, which was an audit report, before it turned into a tutor. The package is also still named "react-example" and a metadata file still describes the audit.

**Why it matters.** It is the first thing seen in the browser tab and in any bookmark or shared link. It tells people the app is something it no longer is.

**What I would change.** Give it a proper name and a one-line description (for example "StructTutor: a personal structural engineering tutor"), update the metadata file and the package name.

**Priority and size.** Should. Small.

### A10. No sign of a light or dark switch

**What it is.** The look is a dark sidebar and page with bright white cards, which the code comments describe as a "hybrid". I could not find a switch to change between light and dark, although your build prompt asked for one if feasible.

**Why it matters.** Many people study in the evening, others in bright rooms. A white card on a dark page can also be glaring for long sessions.

**What I would change.** Decide on purpose: either a full dark theme with dark cards, a full light theme, or a switch. If you keep the hybrid, check it with long reading sessions.

**Priority and size.** Nice. Medium.

### A11. Keyboard use and accessibility

**What it is.** The main screen file has about 20 accessibility labels but no keyboard handling at all (nothing for Tab order or key presses). The Python theme file is better: it already pairs each mastery colour with a distinct shape (○ ◔ ◑ ◕ ●) so colour is never the only signal.

**Why it matters.** Many people prefer working through questions with the keyboard (type an answer, press Enter, press H for a hint). Your build prompt also asked for keyboard navigation. Relying on colour alone excludes colour-blind users.

**What I would change.** Make Enter submit an answer, add shortcuts for hint and next, make every button reachable with Tab and show a clear highlight on the selected one, and apply the shape-plus-colour badge idea from the Python theme to the web app.

**Priority and size.** Should. Medium.

### A12. Fonts load from the internet

**What it is.** The page asks Google's servers for its fonts every time it opens.

**Why it matters.** Your plan is a local-first app that works offline, with no outside network calls. Right now, with no internet, the text silently falls back to a different font and the look changes. It also tells a third party every time you open the app.

**What I would change.** Download the three fonts once and ship them inside the project, so the app looks identical offline.

**Priority and size.** Should. Small.

## 4. Part B: Things that will cause trouble once you add content

### B1. Progress is not saved in the web app

**What it is.** I found no code in the web app or its engine files that stores anything between visits. Refreshing the page, or closing and reopening the browser tab, would reset your answers, mastery and recent sessions. The Python app does store everything properly in a database file.

**Why it matters.** A tutor that forgets you is not a tutor. Adaptive learning (revisiting weak areas, spacing out reviews) cannot work without memory.

**What I would change.** Save attempts, hints used, mastery and settings in the browser's built-in storage (IndexedDB, which is designed for this and holds plenty), and add Export and Import buttons so you can back up your progress to a file.

**Priority and size.** Must. Medium to large.

### B2. Two apps, two copies of the curriculum

**What it is.** The project contains two separate apps. One is the Python desktop app, which has the database, the 62 tests and the maths solvers but no diagrams. The other is the web app, which has the polished screens and diagrams but no saving. Each has its own version of the 20-module syllabus and its own questions.

**Why it matters.** This is the single biggest structural issue. Every time you add or correct a question you would have to do it twice, and the two copies will drift apart. In engineering content, a silent disagreement (one app says 18 kN·m, the other 19) is exactly the kind of error you cannot afford. You would also spend effort polishing two sets of screens.

**What I would change.** Choose one app as the real product. From the screenshots, the feel you like lives in the web app, so I would make that the front end. Keep the Python code only if it has a clear job, for example as an independent referee that re-computes answers to check the web app's numbers (see B6). Retire the rest.

**Priority and size.** Must. This is a decision first (it costs nothing), then medium to large to carry out.

### B3. Questions are written into the program code

**What it is.** In the web app the syllabus and session questions are defined inside a 1,690-line code file (tutorEngine.ts), mixed in with the logic that marks answers. The Python side, by contrast, already keeps its questions in separate data files (JSON).

**Why it matters.** Think of it as writing exam questions inside the marking software. To add one question you would have to edit code, and a typo could break the app. It also makes your plan to feed in textbook material painful, because every new question means touching code.

**What I would change.** Move all content (modules, objectives, questions, hints, worked solutions, misconceptions) into separate content files with a fixed layout (a schema), and make the app load them. Add an automatic check that rejects a content file with missing pieces, for example a question without an answer, units or a worked solution. Then adding content means filling in a form, not editing code.

**Priority and size.** Must. Large, but it is the investment that makes everything after it quicker.

### B4. One giant screen file

**What it is.** All three main screens (dashboard, tutor, learning map) are inside one 2,108-line file with 29 separate pieces of remembered state (things like "which step am I on" and "is the sidebar collapsed") all tangled together, and long strings of style instructions repeated throughout.

**Why it matters.** It works today, but it is like a single huge spreadsheet tab with every formula in it. Each change risks breaking something unrelated, and an AI assistant or a human developer will find it harder and slower to modify safely.

**What I would change.** Split into one file per screen, plus a small shared store holding the learner's progress, and a shared set of named styles. This changes nothing visible, but it makes every later change cheaper and safer.

**Priority and size.** Should. Medium to large. Best done together with B1 and B3.

### B5. Dead leftovers from the old audit page

**What it is.** Three code files are no longer used by the live app: auditData.ts (467 lines), StructuralDiagram.tsx (692 lines) and practiceEngine.ts (946 lines, only used by the unused diagram file), plus their test. Together that is about 2,100 of 7,300 lines, roughly 29% of the web code. They come from the first version, which was a report about the Python app.

**Why it matters.** Dead code is confusing: someone fixing a bug may fix the wrong copy. It also hides which logic is actually live, and the unused StructuralDiagram file may be a better or different beam diagram than the one in use. I did not compare them.

**What I would change.** First check whether anything in those files is worth keeping (especially the diagrams), then delete the rest. Version control will keep the history.

**Priority and size.** Should. Small.

### B6. The beam calculator is narrow, and the desktop app draws nothing

**What it is.** The Python maths covers 17 worked examples, one hard-coded function each. For beams, from the function names, it handles simply supported beams with a UDL (even load) or one point load, and a cantilever with a UDL. The desktop app's screens contain no drawing code at all, even though a plotting library (matplotlib) is listed as a requirement. Your own validation example, a beam with an overhang, a partial UDL and a point load, is not covered.

**Why it matters.** Shear force and bending moment diagrams for arbitrary loading are the core of what you said you want to become strong at. A tutor that can only mark a handful of fixed cases cannot generate fresh variations, which is what practice needs.

**What I would change.** Build one general beam engine that takes any list of supports and loads (point loads, full or partial UDLs, applied moments, overhangs) and produces reactions, shear and moment, with an independent check, and draws the diagrams from the result. Never show a stored picture that does not match the load case, which your build prompt already insists on.

**Priority and size.** Should (Must if beams are your first content module). Large.

### B7. Nobody has reviewed the engineering content yet

**What it is.** The starter questions, worked solutions and syllabus text were generated by an AI. The Python side is honest about this: one example is flagged REFERENCE\_VERIFICATION\_REQUIRED because exact steel section properties need a controlled table, and the syllabus carries an educational-use notice. I could not see a comparable visible notice in the web screenshots.

**Why it matters.** A tutor that teaches a wrong value or a wrong sign convention is worse than no tutor. Good tests prove the code does what it was told, not that what it was told is right.

**What I would change.** Add a visible status on every question (Draft, Checked by me, Checked against source) and show only checked ones as "secure". Put a short always-visible notice that it is educational software and not a design check. Keep a log of which book, edition and page each fact came from. Work through the starter content once with your textbooks.

**Priority and size.** Must, before any real use. Ongoing.

### B8. Planned features that are not built

**What it is.** Your build prompt described a source library (import your PDFs, search them, show page citations) and an optional local AI tutor. The Python code has the search index tables prepared, but nothing that reads a PDF. The PDF library is listed as a requirement but never used. Ollama (the local AI runner) appears only as two empty settings. In the web app, the Gemini AI package, a server package (express), a settings reader (dotenv) and an animation package (motion) are installed but nothing uses them.

**Why it matters.** The documentation and the project list suggest more than exists, so you could assume something works when it does not. Your textbook plan also depends on the source library, so you will need to decide how content gets in.

**What I would change.** Decide how textbook content will reach the app. Options: (a) you or an AI draft questions from the books and load them through the content files in B3, with review; (b) build PDF import with page-level citations later. I would do (a) first because it is simpler and keeps you in control. Mark clearly in the app and README which features are not built yet.

**Priority and size.** Should (decision) then large for any build.

### B9. No process for loading a new module

**What it is.** Nothing in the project describes the steps for taking a chapter and turning it into objectives, questions, hints, worked solutions and mastery rules.

**Why it matters.** You are about to do this many times. Without a repeatable recipe, quality and style will vary from module to module, and the app will feel uneven.

**What I would change.** Write a one-page content template: learning objective in plain words, explanation, three levels of hint, a worked example, a typical mistake with its diagnosis, an extension question, units, source reference and review status. Then use it for every module.

**Priority and size.** Should. Small to medium.

## 5. Part C: Housekeeping and packaging

### C1. Confusing launch files

**What it is.** There are several launch scripts. The one called run\_windows.bat in the main folder and in the structtutor folder opens the web app (through launch\_app.vbs or the standalone HTML file). The Python desktop app is started by a differently named script, run\_legacy\_python\_desktop.bat. The Python setup script finishes by telling you to launch with run\_windows.bat, and the Python README says the same, but that file opens the web app instead.

**Why it matters.** Following the instructions leads you to the wrong app. This is the kind of thing that makes you lose twenty minutes after a break from the project.

**What I would change.** One launch file, one clearly named purpose, and documentation that matches. Remove the duplicates once B2 is decided.

**Priority and size.** Should. Small.

### C2. The same large file is stored three times

**What it is.** StructTutor\_App.html (673 KB, the whole web app packed into one file) appears in three places, byte for byte identical.

**Why it matters.** It is a generated product, not something you edit. If you change the source and rebuild only one copy, the others quietly become out of date, and you may run an old version without realising.

**What I would change.** Keep one built copy, produced by a single build command, and add the version number and build date to the footer so you can always see which one you are running.

**Priority and size.** Should. Small.

### C3. Clutter inside the project

**What it is.** The project carries old zip files of earlier milestones (two identical copies of about 166 KB each, plus others), roughly 13 saved screenshots from the AI tool, the master build prompt, and a pasted-text file with no file extension.

**Why it matters.** It makes the project look larger and messier than it is, makes backups heavier, and makes it hard to tell the current code from past versions.

**What I would change.** Move the build prompt and screenshots into a docs folder, delete the nested zips (keep a dated backup elsewhere), and rename or remove the extensionless file. Use version control for history instead.

**Priority and size.** Nice. Small.

### C4. Unused software packages and leftover tool settings

**What it is.** Four installed packages (the Gemini AI SDK, express, dotenv and motion) are not used by any file. The main README is the Google AI Studio boilerplate, including a banner image from Google's site, instructions to set a Gemini API key, and a sample settings file describing Google Cloud hosting. The app does not use any of that.

**Why it matters.** Unused packages add download size and security exposure for no benefit, and a mention of an API key sets the wrong expectation for a local-first, no-cloud app.

**What I would change.** Remove the unused packages, replace the README with one that describes StructTutor, and delete the Google-specific sample settings.

**Priority and size.** Should. Small.

### C5. Testing is thin on the web side

**What it is.** The Python side has 62 passing tests. The web side has 11 (6 on the unused engine, 5 on the live one). The web project has no "test" command, so you would need to know the right incantation to run them. No tests cover the screens, and nothing checks that the web app and the Python solvers agree.

**Why it matters.** Tests are what let you make changes confidently. Right now the part you will change most (the web app) is the least protected.

**What I would change.** Add a one-line test command, write tests for answer marking and for loading content (including the schema check from B3), and add a small test that feeds the same inputs to both the web engine and the Python solvers and compares the results. Add a few basic click-through tests for the main flow (start a question, ask for a hint, submit, see feedback).

**Priority and size.** Should. Medium.

### C6. Out-of-date counts in the documentation

**What it is.** The Python README says the full suite is 50 tests; it is now 62. The web page text said 44 tests in the earlier version.

**Why it matters.** Small, but wrong documentation erodes trust. Your own prompt says docs must describe what is really implemented.

**What I would change.** Avoid hard numbers in documentation, or generate them automatically.

**Priority and size.** Nice. Small.

### C7. Catch-all error handling

**What it is.** I found five places in the Python code that catch errors broadly ("except Exception" or a bare except). I did not inspect each.

**Why it matters.** Catching everything can hide real faults, so something fails quietly and gives a wrong or empty result instead of a clear message.

**What I would change.** Review each one. Catch only the specific problems you expect, and show or log a clear message for the rest.

**Priority and size.** Nice. Small.

### C8. Settings and data location

**What it is.** The Python app stores learner data in a database file; the web app stores nothing yet. There is no single place in the interface to see where data lives, back it up or reset it.

**Why it matters.** Local-first only works if backup and restore are easy. Losing months of progress would be a serious setback.

**What I would change.** A Settings page with Export my data, Import my data, Reset progress (with a confirmation) and a note showing where the data is stored.

**Priority and size.** Should. Medium.

## 6. Part D: What I would leave alone

Keeping this list matters as much as the fixes, because it protects what already works.

- **The overall layout and visual direction:** collapsible left sidebar, one main accent colour, calm spacing, readable type.
- **The step-by-step tutor flow:** learn, guided practice, independent practice, summary, with step pills and a progress bar.
- **The worked-solution drawer, Units Reference drawer and Scratchpad Calculator.** These are good ideas and fit how engineers actually work.
- **The learning map:** stages, nested objectives, search, and filters for In Progress, Mastered and Locked.
- **Diagrams with honest labels,** such as "Not drawn to scale" and tension and compression noted.
- **The Python domain design:** maths with no screen dependencies, validated inputs, and an independent second calculation for every answer. That is a rare and valuable habit.
- **The 20-module syllabus structure** and the mastery stages (Not assessed, Emerging, Developing, Provisional, Secure).
- **The "Resume practice" hero card** as the main dashboard action.

## 7. Part E: Suggested order of work

**Step 0: Decide (no work).** Pick the web app or the Python app as the real product (B2). Decide whether to keep XP (A3). Decide how textbook content will get in (B8).

**Step 1: Quick clean-up (about half a day).** A1 developer button, A2 fake data (at least hide it), A4 emoji, A5 jargon, A9 browser tab and names, A12 local fonts, C1 launch files, C2 one built copy, C4 unused packages and README, C6 doc numbers.

**Step 2: Foundations (about two to four days).** B5 delete dead code, B4 split the main file, B1 save progress with Export and Import, A2 proper first-run state, C8 settings page.

**Step 3: Content pipeline (about two to four days).** B3 move content to files with a checked layout, B9 content template, B7 review status on every question and visible notice, C5 test command and tests.

**Step 4: Screen polish (about one to two days).** A6 tutor header, A7 repeated buttons, A8 sensible number formatting, A10 theme decision, A11 keyboard use.

**Step 5: Calculation depth (about one to two weeks).** B6 general beam engine with diagrams, the agreement test between engines, then new modules following your template.

These are estimates for a person working with an AI coding assistant and reviewing the results. They will vary with how much you want to change along the way.

## 8. Part F: Decisions I need from you

1. **Which app is the real one?** Web (where the feel is) or Python desktop. This one decision removes about a third of the cleaning list.
2. **Keep or drop XP and points?** I recommend dropping them.
3. **Light, dark or both?** Currently a mix.
4. **How will textbook content arrive?** Typed in or drafted with AI and reviewed by you, or imported from PDFs with page citations.
5. **Who is this for?** Just you, or eventually other engineers? That changes how much of the clean-up, accessibility and documentation is worth doing now.

## 9. Plain-English glossary

- **Prototype:** a rough working version used to test an idea. Not meant to be final.
- **Dead code:** code still in the project that nothing uses any more.
- **Persistence:** saving information so it is still there next time you open the app.
- **State:** what an app is remembering right now, such as which question you are on.
- **Schema:** a fixed template a file must follow, so mistakes are caught automatically.
- **JSON:** a simple text format for storing structured data like questions and answers.
- **IndexedDB:** the browser's built-in storage, used so the web app can remember things.
- **Dependency or package:** a ready-made piece of software your project relies on.
- **Single source of truth:** one place where each fact lives, so there are never two conflicting versions.
- **Oracle (test oracle):** an independent calculation used to check another calculation is right.
- **First-run state:** what a brand-new user sees before any data exists.
- **Version control:** a system that records every change to a project, so old versions can be recovered and you do not need duplicate copies.
