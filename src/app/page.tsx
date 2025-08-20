'use client'
import Image from "next/image";
import React, { useState } from 'react';

export default function Home() {

    const [showAllNews, setShowAllNews] = useState(false);

    // Dados simulados (em uma aplicação real viriam de uma API)
    const dashboardData = {
      saldo: {
        disponivel: "R$ 0,00",
        aReceber: "R$ 0,00"
      },
      atividades: {
        vencidas: 0,
        paraHoje: 0
      },
      noticias: [
        {
          id: 1,
          titulo: "Como funcionam as webhooks do PowerSign?",
          imagem: "https://site.powercrm.com.br/wp-content/uploads/2022/05/thumbnails-360x300-webhook.png",
          link: "https://site.powercrm.com.br/como-funcionam-as-webhooks-do-powersign/",
          tag: "Novidades",
          data: "30 de Julho/25"
        },
        {
          id: 2,
          titulo: "Nota de Atualização 26.05 (Power Sign)",
          imagem: "https://site.powercrm.com.br/wp-content/uploads/2023/06/Inserir-um-titulo-3.png",
          link: "https://site.powercrm.com.br/nota-de-atualizacao-26-05-power-sign/",
          tag: "Novidades",
          data: "24 de Junho/25"
        },
        {
          id: 3,
          titulo: "Nota de Atualização 26.04 (Power CRM)",
          imagem: "https://site.powercrm.com.br/wp-content/uploads/2023/06/Inserir-um-titulo-3.png",
          link: "https://site.powercrm.com.br/nota-de-atualizacao-26-04-power-crm/",
          tag: "Novidades",
          data: "24 de Junho/25"
        },
        {
          id: 4,
          titulo: "Nota de Atualização 27.05 (Power Sign)",
          imagem: "https://site.powercrm.com.br/wp-content/uploads/2023/06/Inserir-um-titulo-3.png",
          link: "https://site.powercrm.com.br/nota-de-atualizacao-27-05-power-sign/",
          tag: "Novidades",
          data: "27 de Maio/25"
        },
        {
          id: 5,
          titulo: "Nota de Atualização 27.05 (Power CRM)",
          imagem: "https://site.powercrm.com.br/wp-content/uploads/2023/06/Inserir-um-titulo-3.png",
          link: "https://site.powercrm.com.br/nota-de-atualizacao-27-05-power-crm/",
          tag: "Novidades",
          data: "27 de Maio/25"
        },
        {
          id: 6,
          titulo: "Nota de Atualização 06.05 (Power Sign)",
          imagem: "https://site.powercrm.com.br/wp-content/uploads/2023/06/Inserir-um-titulo-3.png",
          link: "https://site.powercrm.com.br/nota-de-atualizacao-06-05-power-sign/",
          tag: "Novidades",
          data: "07 de Maio/25"
        },
        {
          id: 7,
          titulo: "Nota de Atualização 06.05 (Power CRM)",
          imagem: "https://site.powercrm.com.br/wp-content/uploads/2023/06/Inserir-um-titulo-3.png",
          link: "https://site.powercrm.com.br/nota-de-atualizacao-06-05-power-crm/",
          tag: "Novidades",
          data: "07 de Maio/25"
        },
        {
          id: 8,
          titulo: "Nota de Atualização 25.03 (Power CRM)",
          imagem: "https://site.powercrm.com.br/wp-content/uploads/2023/06/Inserir-um-titulo-3.png",
          link: "https://site.powercrm.com.br/nota-de-atualizacao-25-03-power-crm/",
          tag: "Novidades",
          data: "25 de Março/25"
        },
        {
          id: 9,
          titulo: "Nota de Atualização 20.02 (Power Sign)",
          imagem: "https://site.powercrm.com.br/wp-content/uploads/2023/06/Inserir-um-titulo-3.png",
          link: "https://site.powercrm.com.br/nota-de-atualizacao-12-02-power-sign/",
          tag: "Novidades",
          data: "12 de Fevereiro/25"
        },
        {
          id: 10,
          titulo: "Nota de Atualização 05.02 (Power CRM)",
          imagem: "https://site.powercrm.com.br/wp-content/uploads/2023/06/Inserir-um-titulo-3.png",
          link: "https://site.powercrm.com.br/nota-de-atualizacao-05-02-power-crm/",
          tag: "Novidades",
          data: "05 de Fevereiro/25"
        }
      ]
    };

    const toggleNews = () => {
      setShowAllNews(!showAllNews);
    };

    return (
      <div className="min-h-screen bg-gray-50 p-4 md:p-6">
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row gap-6">
          {/* Conteúdo principal */}
          <div className="flex-1">
            <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
              <h1 className="text-2xl md:text-3xl font-bold text-gray-800">Olá, Marcel Araújo</h1>
              <p className="text-gray-600 mt-2">
                <strong>Acompanhe seu trabalho e novidades do Power CRM.</strong>
              </p>
            </div>

            {/* Seção Saldo */}
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-gray-700 mb-4">Saldo</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-green-100 rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow">
                  <a href="/internal/iuguBeneficiaryPanel" className="block">
                    <p className="text-gray-600">Disponivel</p>
                    <strong className="text-green-600 text-xl">{dashboardData.saldo.disponivel}</strong>
                  </a>
                </div>

                <div className="bg-blue-100 rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow">
                  <a href="/internal/iuguBeneficiaryPanel" className="block">
                    <p className="text-gray-600">A Receber</p>
                    <strong className="text-blue-600 text-xl">{dashboardData.saldo.aReceber}</strong>
                  </a>
                </div>
              </div>
            </div>

            {/* Seção Atividades */}
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-gray-700 mb-4">Atividades</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow flex flex-col items-center justify-center text-center">
                  <a href="/company/pipeline" className="block">
                    <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center mb-3 mx-auto">
                      <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                      </svg>
                    </div>
                    <p className="text-gray-700">Acesse suas<br />negociações</p>
                  </a>
                </div>

                <div className="bg-red-100 rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow flex flex-col items-center justify-center text-center">
                  <a id="activitiesLateLink" href="/crm/activity/?f=late" className="block">
                    <span className="text-red-600 text-2xl font-bold mb-2">{dashboardData.atividades.vencidas}</span>
                    <p className="text-gray-700">Atividades <br />Vencidas</p>
                  </a>
                </div>

                <div className="bg-blue-100 rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow flex flex-col items-center justify-center text-center">
                  <a href="/crm/activity/?f=today" className="block">
                    <span className="text-blue-600 text-2xl font-bold mb-2">{dashboardData.atividades.paraHoje}</span>
                    <p className="text-gray-700">Atividades <br />Para hoje</p>
                  </a>
                </div>
              </div>
            </div>

            {/* Seção Central de Ajuda */}
            <div>
              <h3 className="text-lg font-semibold text-gray-700 mb-4">Central de ajuda</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow flex flex-col items-center justify-center text-center">
                  <a target="_blank" rel="noopener noreferrer" href="https://youtube.com/playlist?list=PLkx4o3GGrL5fylzae6xrR87PsunJnr8wr&si=TjKIF-dptpehOnEz" className="block">
                    <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center mb-3 mx-auto">
                      <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"></path>
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                      </svg>
                    </div>
                    <p className="text-gray-700">Curso <br />Power CRM</p>
                  </a>
                </div>

                <div className="bg-white rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow flex flex-col items-center justify-center text-center">
                  <a target="_blank" rel="noopener noreferrer" href="https://powercrm.zendesk.com/hc/pt-br" className="block">
                    <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center mb-3 mx-auto">
                      <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                      </svg>
                    </div>
                    <p className="text-gray-700">Central de<br />Ajuda</p>
                  </a>
                </div>

                <div className="bg-white rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow flex flex-col items-center justify-center text-center">
                  <a target="_blank" rel="noopener noreferrer" href="https://powercrm.zendesk.com/hc/pt-br/requests/new" className="block">
                    <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center mb-3 mx-auto">
                      <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                      </svg>
                    </div>
                    <p className="text-gray-700">Envie uma <br />solicitação</p>
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Seção de Notícias */}
          <div className="w-full lg:w-2/5">
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="text-xl font-bold text-gray-800 mb-5">Novidades do Power CRM</h3>
              <div className="space-y-5">
                {dashboardData.noticias.slice(0, showAllNews ? dashboardData.noticias.length : 6).map((noticia) => (
                  <div key={noticia.id} className="border-b pb-5 last:border-0 last:pb-0">
                    <div className="flex gap-4">
                      <div className="flex-shrink-0">
                        <a target="_blank" rel="noopener noreferrer" href={noticia.link}>
                          <img src={noticia.imagem} alt={noticia.titulo} className="w-24 h-20 object-cover rounded-lg" />
                        </a>
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">{noticia.tag}</span>
                          <span className="text-xs text-gray-500">{noticia.data}</span>
                        </div>
                        <h4 className="font-semibold text-gray-800 hover:text-blue-600 transition-colors">
                          <a target="_blank" rel="noopener noreferrer" href={noticia.link}>
                            {noticia.titulo}
                          </a>
                        </h4>
                      </div>
                    </div>
                  </div>
                ))}

                <button
                  onClick={toggleNews}
                  className="flex items-center justify-center gap-2 w-full py-2 text-blue-600 hover:text-blue-800 transition-colors"
                >
                  {showAllNews ? (
                    <>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 15l7-7 7 7"></path>
                      </svg>
                      Mostrar menos
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                      </svg>
                      Mostrar mais
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
}
