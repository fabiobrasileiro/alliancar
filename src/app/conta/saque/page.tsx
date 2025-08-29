"use client"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table"
import Image from "next/image"
import SidebarLayout from "@/components/SidebarLayoute"


export default function ContaDeSaqueIugu() {
  return (
    <SidebarLayout>
      <div className="space-y-6">
        <h2 className="text-2xl font-semibold">Conta de Saque Iugu</h2>

        <Tabs defaultValue="conta" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="conta">Conta de Saque</TabsTrigger>
            <TabsTrigger value="sacar">Sacar</TabsTrigger>
            <TabsTrigger value="historico">Histórico de Saques</TabsTrigger>
          </TabsList>

          {/* Aba Conta de Saque */}
          <TabsContent value="conta">
            <Card>
              <CardContent className="space-y-4 p-6">
                <p>
                  Beneficiário da Conta de Saque: <strong>Marcel Araújo</strong><br />
                  CPF: <strong>053.335.305-05</strong><br />
                  Conta Iugu: <strong>-</strong>
                </p>
                <hr />
                <div>
                  <strong>Dados para Saque:</strong><br />
                  Banco: <span>-</span><br />
                  Agência: <span>-</span><br />
                  Conta: <span>-</span><br />
                  Tipo de Conta: <span>-</span>
                </div>

                <Button className="w-56 hidden">Alterar conta</Button>

                <div className="flex flex-col md:flex-row gap-6 items-center justify-between border rounded-lg p-4 bg-muted/30">
                  <div className="flex items-center gap-4">
                    <Image width={150} height={150} src="/" alt="Saldo" className="w-12 h-12" />
                    <div>
                      <p className="text-sm text-muted-foreground">Saldo total disponível</p>
                      <p className="text-lg font-semibold">R$ 0,00</p>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">A receber (parcelado)</p>
                    <p className="font-medium">R$ 0,00</p>
                  </div>
                </div>

                <div className="flex gap-2 mt-4">
                  <Image width={150} height={150} src="/" alt="Dúvidas" className="w-5 h-5 mt-1" />
                  <p className="text-sm text-muted-foreground">
                    <strong>Vendas parceladas</strong> em cartão de crédito serão liberadas a cada 30 dias de acordo com o número de parcelas.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Aba Sacar */}
          <TabsContent value="sacar">
            <Card>
              <CardContent className="grid md:grid-cols-2 gap-6 p-6">
                <div>
                  <p className="text-sm text-muted-foreground">Disponível para saque</p>
                  <p className="text-lg font-bold text-green-600">R$ 0,00</p>

                  <div className="mt-4 text-sm text-muted-foreground">
                    <p>Detalhes do saque:</p>
                    <p>Tarifa de saque: <strong className="text-foreground">R$ 1,99</strong></p>
                    <p>Os pagamentos serão realizados em até 3 dias úteis.</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <label className="text-sm font-medium">O saque será realizado para a conta bancária principal</label>
                  <div>
                    <label className="text-sm font-medium">Valor do saque</label>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-muted-foreground">R$</span>
                      <Input type="text" placeholder="0,00" className="text-right" />
                    </div>
                  </div>
                  <Button className="w-56 bg-green-600 hover:bg-green-700">Efetuar Saque</Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Aba Histórico */}
          <TabsContent value="historico">
            <Card>
              <CardContent className="p-6">
                <p className="mb-4">&gt; Total <strong>0</strong> registros</p>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Data do pedido</TableHead>
                      <TableHead>Efetivado em</TableHead>
                      <TableHead>Valor</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Detalhes</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow>
                      <TableCell colSpan={5} className="text-center text-sm text-muted-foreground">
                        Não há dados para exibir
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </SidebarLayout>

  )
}