import { supabase } from "./lib/supabase";
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

createRoot(document.getElementById("root")!).render(<App />);
supabase.auth.getSession().then(({ data }) => {
  console.log("Supabase connected:", data.session);
});