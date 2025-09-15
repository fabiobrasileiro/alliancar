// import { useState } from 'react';
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import { Badge } from "@/components/ui/badge";
// import { Label } from "@/components/ui/label";
// import { Checkbox } from "@/components/ui/checkbox";
// import {
//   Select,
//   SelectContent,
//   SelectItem,
//   SelectTrigger,
//   SelectValue,
// } from "@/components/ui/select";
// import {
//   Dialog,
//   DialogContent,
//   DialogHeader,
//   DialogTitle,
//   DialogTrigger,
// } from "@/components/ui/dialog";
// import { Filter, X, ChevronDown, ChevronUp, Calendar, Tag, Users, MapPin, Check } from "lucide-react";

// export interface StatusNegociacao {
//   id: string;
//   nome: string;
// }

// export interface FilterData {
//   tipoData: string;
//   dataInicial: string;
//   dataFinal: string;
//   status: StatusNegociacao[];
//   marcas: string[];
//   modelos: string[];
//   valorMin: number;
//   valorMax: number;
// }

// interface FilterModalProps {
//   isOpen: boolean;
//   onOpenChange: (open: boolean) => void;
//   filterData: FilterData;
//   onFilterChange: <K extends keyof FilterData>(field: K, value: FilterData[K]) => void;
//   onSubmit: () => void;
//   onClear: () => void;
//   activeFilters: number;
// }

// // Dados de exemplo
// const statusOptions: StatusNegociacao[] = [
//   { id: "1", nome: "Em negociação" },
//   { id: "2", nome: "Aprovado" },
//   { id: "3", nome: "Recusado" },
//   { id: "4", nome: "Cancelado" },
// ];

// const marcaOptions = ["Toyota", "Honda", "Ford", "Chevrolet", "Volkswagen", "Fiat"];
// const modeloOptions = ["Corolla", "Civic", "Focus", "Cruze", "Golf", "Uno"];

// export default function FilterModal({
//   isOpen,
//   onOpenChange,
//   filterData,
//   onFilterChange,
//   onSubmit,
//   onClear,
//   activeFilters,
// }: FilterModalProps) {
//   const [expandedSections, setExpandedSections] = useState({
//     data: true,
//     status: true,
//     veiculo: true,
//     valor: true
//   });

//   const toggleSection = (section: keyof typeof expandedSections) => {
//     setExpandedSections(prev => ({
//       ...prev,
//       [section]: !prev[section]
//     }));
//   };

//   const handleStatusChange = (status: StatusNegociacao) => {
//     const isSelected = filterData.status.some(s => s.id === status.id);
//     let newStatus: StatusNegociacao[];

//     if (isSelected) {
//       newStatus = filterData.status.filter(s => s.id !== status.id);
//     } else {
//       newStatus = [...filterData.status, status];
//     }

//     onFilterChange("status", newStatus);
//   };

//   // const handleMarcaChange = (marca: string) => {
//   //   const isSelected = filterData.marcas.includes(marca);
//   //   let newMarcas: string[];

//   //   if (isSelected) {
//   //     newMarcas = filterData.marcas.filter(m => m !== marca);
//   //   } else {
//   //     newMarcas = [...filterData.marcas, marca];
//   //   }

//   //   onFilterChange("marcas", newMarcas);
//   // };

//   const handleModeloChange = (modelo: string) => {
//     const isSelected = filterData.modelos.includes(modelo);
//     let newModelos: string[];

//     if (isSelected) {
//       newModelos = filterData.modelos.filter(m => m !== modelo);
//     } else {
//       newModelos = [...filterData.modelos, modelo];
//     }

//     onFilterChange("modelos", newModelos);
//   };

//   const handleClear = () => {
//     onClear();
//   };

//   const handleSubmit = () => {
//     // Validação simples de datas
//     if (filterData.dataInicial && filterData.dataFinal && filterData.dataInicial > filterData.dataFinal) {
//       alert("Data inicial não pode ser maior que data final");
//       return;
//     }

//     onSubmit();
//   };

//   return (
//     <Dialog open={isOpen} onOpenChange={onOpenChange}>
//       <DialogTrigger asChild>
//         <Button variant="outline" className="flex items-center gap-2 relative">
//           <Filter className="w-4 h-4" />
//           <span>Filtrar</span>
//           {activeFilters > 0 && (
//             <Badge variant="default" className="absolute -top-2 -right-2 min-w-5 h-5 flex items-center justify-center p-0 rounded-full">
//               {activeFilters}
//             </Badge>
//           )}
//         </Button>
//       </DialogTrigger>
//       <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
//         <DialogHeader className="pb-4">
//           <div className="flex items-center justify-between">
//             <DialogTitle className="text-xl font-semibold flex items-center gap-2">
//               <Filter className="w-5 h-5" />
//               Filtros Avançados
//             </DialogTitle>
//             <Button
//               variant="ghost"
//               size="icon"
//               onClick={() => onOpenChange(false)}
//               className="h-8 w-8"
//             >
//               <X className="w-4 h-4" />
//             </Button>
//           </div>
//         </DialogHeader>

//         <div className="space-y-6 py-2">
//           {/* Filtros de Data */}
//           <div className="border rounded-lg overflow-hidden">
//             <button
//               className="flex items-center justify-between w-full p-4 bg-muted/50 hover:bg-muted/70 transition-colors"
//               onClick={() => toggleSection('data')}
//             >
//               <div className="flex items-center gap-2">
//                 <Calendar className="w-5 h-5" />
//                 <span className="font-medium">Filtros de Data</span>
//               </div>
//               {expandedSections.data ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
//             </button>

//             {expandedSections.data && (
//               <div className="p-4 space-y-4">
//                 <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
//                   <div className="space-y-2">
//                     <Label htmlFor="tipoData">Tipo de Data</Label>
//                     <Select
//                       value={filterData.tipoData}
//                       onValueChange={(value) => onFilterChange("tipoData", value)}
//                     >
//                       <SelectTrigger>
//                         <SelectValue placeholder="Selecione o tipo" />
//                       </SelectTrigger>
//                       <SelectContent>
//                         <SelectItem value="criacao">Data de Criação</SelectItem>
//                         <SelectItem value="atualizacao">Data de Atualização</SelectItem>
//                         <SelectItem value="vencimento">Data de Vencimento</SelectItem>
//                       </SelectContent>
//                     </Select>
//                   </div>

//                   <div className="space-y-2">
//                     <Label htmlFor="dataInicial">Data Inicial</Label>
//                     <Input
//                       id="dataInicial"
//                       type="date"
//                       value={filterData.dataInicial}
//                       onChange={(e) => onFilterChange("dataInicial", e.target.value)}
//                     />
//                   </div>

//                   <div className="space-y-2">
//                     <Label htmlFor="dataFinal">Data Final</Label>
//                     <Input
//                       id="dataFinal"
//                       type="date"
//                       value={filterData.dataFinal}
//                       onChange={(e) => onFilterChange("dataFinal", e.target.value)}
//                     />
//                   </div>
//                 </div>
//               </div>
//             )}
//           </div>

//           {/* Filtros de Status */}
//           <div className="border rounded-lg overflow-hidden">
//             <button
//               className="flex items-center justify-between w-full p-4 bg-muted/50 hover:bg-muted/70 transition-colors"
//               onClick={() => toggleSection('status')}
//             >
//               <div className="flex items-center gap-2">
//                 <Tag className="w-5 h-5" />
//                 <span className="font-medium">Status da Negociação</span>
//                 {/* {filterData.status.length > 0 && (
//                   <Badge variant="default" className="ml-2">
//                     {filterData.status.length}
//                   </Badge>
//                 )} */}
//               </div>
//               {expandedSections.status ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
//             </button>

//             {expandedSections.status && (
//               <div className="p-4">
//                 <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
//                   {statusOptions.map((status) => {
//                     // const isSelected = filterData.status.some(s => s.id === status.id);
//                     return (
//                       <div
//                         key={status.id}
//                         className={`flex items-center space-x-2 p-3 rounded-md border cursor-pointer transition-colors `}
//                         onClick={() => handleStatusChange(status)}
//                       >
//                         <div className={`flex items-center justify-center w-5 h-5 rounded-md border `}>
//                           <Check className="w-3 h-3" />
//                         </div>
//                         <Label className="cursor-pointer flex-1">{status.nome}</Label>
//                       </div>
//                     );
//                   })}
//                 </div>
//               </div>
//             )}
//           </div>

//           {/* Filtros de Veículo */}
//           <div className="border rounded-lg overflow-hidden">
//             <button
//               className="flex items-center justify-between w-full p-4 bg-muted/50 hover:bg-muted/70 transition-colors"
//               onClick={() => toggleSection('veiculo')}
//             >
//               <div className="flex items-center gap-2">
//                 <Users className="w-5 h-5" />
//                 <span className="font-medium">Veículo</span>
//                 {/* {(filterData.marcas.length > 0 || filterData.modelos.length > 0) && (
//                   <Badge variant="default" className="ml-2">
//                     {filterData.marcas.length + filterData.modelos.length}
//                   </Badge>
//                 )} */}
//               </div>
//               {expandedSections.veiculo ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
//             </button>

//             {/* {expandedSections.veiculo && (
//               <div className="p-4 space-y-6">
//                 <div className="space-y-3">
//                   <Label>Marcas</Label>
//                   <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
//                     {marcaOptions.map((marca) => {
//                       const isSelected = filterData.marcas.includes(marca);
//                       return (
//                         <div
//                           key={marca}
//                           className={`flex items-center space-x-2 p-3 rounded-md border cursor-pointer transition-colors ${isSelected ? 'bg-primary/10 border-primary' : 'hover:bg-muted/50'}`}
//                           onClick={() => handleMarcaChange(marca)}
//                         >
//                           <div className={`flex items-center justify-center w-5 h-5 rounded-md border ${isSelected ? 'bg-primary border-primary text-primary-foreground' : 'border-muted-foreground/30'}`}>
//                             {isSelected && <Check className="w-3 h-3" />}
//                           </div>
//                           <Label className="cursor-pointer flex-1">{marca}</Label>
//                         </div>
//                       );
//                     })}
//                   </div>
//                 </div>

//                 <div className="space-y-3">
//                   <Label>Modelos</Label>
//                   <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
//                     {modeloOptions.map((modelo) => {
//                       const isSelected = filterData.modelos.includes(modelo);
//                       return (
//                         <div
//                           key={modelo}
//                           className={`flex items-center space-x-2 p-3 rounded-md border cursor-pointer transition-colors ${isSelected ? 'bg-primary/10 border-primary' : 'hover:bg-muted/50'}`}
//                           onClick={() => handleModeloChange(modelo)}
//                         >
//                           <div className={`flex items-center justify-center w-5 h-5 rounded-md border ${isSelected ? 'bg-primary border-primary text-primary-foreground' : 'border-muted-foreground/30'}`}>
//                             {isSelected && <Check className="w-3 h-3" />}
//                           </div>
//                           <Label className="cursor-pointer flex-1">{modelo}</Label>
//                         </div>
//                       );
//                     })}
//                   </div>
//                 </div>
//               </div>
//             )} */}
//           </div>

//           {/* Filtros de Valor */}
//           <div className="border rounded-lg overflow-hidden">
//             <button
//               className="flex items-center justify-between w-full p-4 bg-muted/50 hover:bg-muted/70 transition-colors"
//               onClick={() => toggleSection('valor')}
//             >
//               <div className="flex items-center gap-2">
//                 <MapPin className="w-5 h-5" />
//                 <span className="font-medium">Faixa de Valor</span>
//                 {(filterData.valorMin > 0 || filterData.valorMax > 0) && (
//                   <Badge variant="default" className="ml-2">
//                     2
//                   </Badge>
//                 )}
//               </div>
//               {expandedSections.valor ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
//             </button>

//             {expandedSections.valor && (
//               <div className="p-4">
//                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                   <div className="space-y-2">
//                     <Label htmlFor="valorMin">Valor Mínimo (R$)</Label>
//                     <Input
//                       id="valorMin"
//                       type="number"
//                       min="0"
//                       value={filterData.valorMin || ''}
//                       onChange={(e) => onFilterChange("valorMin", Number(e.target.value))}
//                       placeholder="0,00"
//                     />
//                   </div>

//                   <div className="space-y-2">
//                     <Label htmlFor="valorMax">Valor Máximo (R$)</Label>
//                     <Input
//                       id="valorMax"
//                       type="number"
//                       min="0"
//                       value={filterData.valorMax || ''}
//                       onChange={(e) => onFilterChange("valorMax", Number(e.target.value))}
//                       placeholder="0,00"
//                     />
//                   </div>
//                 </div>
//               </div>
//             )}
//           </div>
//         </div>

//         {/* Botões de Ação */}
//         <div className="flex flex-col sm:flex-row justify-between gap-3 pt-4 border-t">
//           <Button
//             variant="outline"
//             onClick={handleClear}
//             className="order-2 sm:order-1"
//           >
//             Limpar Filtros
//           </Button>

//           <div className="flex gap-3 order-1 sm:order-2">
//             <Button
//               variant="outline"
//               onClick={() => onOpenChange(false)}
//             >
//               Cancelar
//             </Button>
//             <Button onClick={handleSubmit}>
//               Aplicar Filtros
//             </Button>
//           </div>
//         </div>
//       </DialogContent>
//     </Dialog>
//   );
// }
