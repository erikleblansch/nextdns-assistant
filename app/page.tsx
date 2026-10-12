import { getChatGPTUser } from "./chatgpt-auth";
import SetupScreen from "./setup-screen";

export const dynamic = "force-dynamic";
export default async function Home() {
  const user = await getChatGPTUser();
  return <SetupScreen signedIn={Boolean(user)} />;
}
