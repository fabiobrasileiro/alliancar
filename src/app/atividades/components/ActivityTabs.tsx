import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import ActivityCard from "./ActivityCard";
import { Atividade } from "./types";

interface ActivityTabsProps {
  atividades: Atividade[];
  activeTab: "atrasada" | "hoje" | "planejada" | "concluida";
  onTabChange: (tab: "atrasada" | "hoje" | "planejada" | "concluida") => void;
  onEdit: (atividade: Atividade) => void;
  onDelete: (id: number) => void;
  loading: boolean;
}

export default function ActivityTabs({
  atividades,
  activeTab,
  onTabChange,
  onEdit,
  onDelete,
  loading,
}: ActivityTabsProps) {
  const countByStatus = {
    atrasada: atividades.filter((a) => a.status === "atrasada").length,
    hoje: atividades.filter((a) => a.status === "hoje").length,
    planejada: atividades.filter((a) => a.status === "planejada").length,
    concluida: atividades.filter((a) => a.status === "concluida").length,
  };

  return (
    <Tabs
      value={activeTab}
      onValueChange={(value) => onTabChange(value as any)}
      className=""
    >
      <TabsList className="w-full md:h-12 h-16 flex flex-wrap mb-14 md:mb-0">
        <TabsTrigger value="atrasada">
          Atrasadas
          <Badge variant="red">{countByStatus.atrasada}</Badge>
        </TabsTrigger>
        <TabsTrigger value="hoje">
          Para hoje
          <Badge variant="blue">{countByStatus.hoje}</Badge>
        </TabsTrigger>
        <TabsTrigger value="planejada">
          Planejadas
          <Badge variant="gray">{countByStatus.planejada}</Badge>
        </TabsTrigger>
        <TabsTrigger value="concluida">
          Concluídas
          <Badge variant="green">{countByStatus.concluida}</Badge>
        </TabsTrigger>
      </TabsList>

      {loading ? (
        <div className="flex justify-center items-center my-8">
          <p>Carregando atividades...</p>
        </div>
      ) : (
        <>
          {(["atrasada", "hoje", "planejada", "concluida"] as const).map(
            (status) => (
              <TabsContent key={status} value={status}>
                <div className="flex flex-col gap-4 mt-4">
                  {atividades.filter((a) => a.status === status).length > 0 ? (
                    atividades
                      .filter((a) => a.status === status)
                      .map((atividade) => (
                        <ActivityCard
                          key={atividade.id}
                          atividade={atividade}
                          onEdit={onEdit}
                          onDelete={onDelete}
                        />
                      ))
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      Nenhuma atividade encontrada
                    </div>
                  )}
                </div>
              </TabsContent>
            ),
          )}
        </>
      )}
    </Tabs>
  );
}
