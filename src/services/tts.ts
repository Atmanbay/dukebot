import googleTTS from "google-tts-api";

export const getAudioUrl = ({
  text,
  lang = "en",
  slow = false,
}: {
  text: string;
  lang?: string;
  slow?: boolean;
}) => {
  return googleTTS.getAudioUrl(text, {
    lang,
    slow,
  });
};
