import type { Metadata } from "next";
import { CabecalhoArquivo } from "@/components/CabecalhoArquivo";
import { SoComConta } from "@/components/SoComConta";
import { FormFeedback } from "./FormFeedback";

export const metadata: Metadata = { title: "Feedback" };

export default function Feedback() {
  return (
    <SoComConta
      titulo="Entre para mandar feedback"
      texto="O feedback fica ligado à sua conta para a equipe conseguir entender o que aconteceu. A conta é grátis."
    >
      <div className="container pagina">
        <CabecalhoArquivo
          rotulo="Fale com a equipe"
          titulo="Feedback"
          descricao="O Fólium está começando e cada sugestão conta. Conte o que ajudaria, o que deu errado ou o que você gostou. Só a equipe lê."
        />
        <FormFeedback />
      </div>
    </SoComConta>
  );
}
