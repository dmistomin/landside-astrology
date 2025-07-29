## Context

- I'm looking to plan a small, MVP translation app that can be easily built with Claude Code and occasional manual edits.
- This app will be designed for personal use: living in Japan, I find that mainstream tools like Google Translate or DeepL don't quite serve my needs. My main problem is that I speak a little bit of Japanese, but for complex conversations I quickly get overwhelmed and stop following the thread of the discussion. This problem is especially bad on the phone.
- What I want this app to do: when the user hits the "start" button, the app accurately transcribe Japanese audio from the environment (when it's run as a webapp from a phone of laptop). As it transcribes the audio, it shows a side-by-side translation to English. When the user hits the "stop" button, the transcript and translation is saved for future reference.
- As a stretch goal, perhaps this app could even "classify"/"summarize" conversations in real-time / after and give the user a list of Japanese vocabulary terms / grammar that were used in the conversation.
- To keep things simple, this apps should mostly leverage existing translation, transcription, and LLM APIs that are commercially available. Particularly, I'm interested in using the [Deepgram speech-to-text live audio API](https://developers.deepgram.com/reference/speech-to-text-api/listen-streaming), as it seems to satisfy most of my requirements. And then potentially combine it with a translation API, not sure which yet.
- I'm interested in using modern tooling like Bun / React / TypeScript if possible (but with an emphasis on building browser-only app without a server, see below).
- Ideally, this app would be server-less, and front-end only + 3rd part APIs only. The user would enter their API keys, which would be saved in local storage. The app would then handle all of the API requests, use local DB in the browser.

## Task

Before doing any work, stop and think deeply - do you need any information from the user? Ask clarifying questions if needed to get the generate the best output possible.

After you've collected all relevant data, create a file called `project_plan.md` that covers the following content:

1. Description of proposed app functionality.
2. Tech stack used.
3. Proposed system architecture - high-level examples of classes and interfaces, APIs, file structure.

Keep the file concise and straightforward; assume it will be read by a technical audience that is familiar with the subject matter (engineers, product managers). It will also be fed into the LLM generating the code as background context.
