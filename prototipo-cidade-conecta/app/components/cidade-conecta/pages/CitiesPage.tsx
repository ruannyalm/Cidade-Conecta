"use client";

import { ChevronRight, Lightbulb, MapPin } from "lucide-react";
import { regions } from "../shared";

export function CitiesPage({
  selectedRegion,
  selectedCity,
  setSelectedRegion,
  setSelectedCity,
}: {
  selectedRegion: string;
  selectedCity: string;
  setSelectedRegion: (value: string) => void;
  setSelectedCity: (value: string) => void;
}) {
  const region =
    regions.find((item) => item.name === selectedRegion) || regions[3];
  const selectRegion = (value: string) => {
    setSelectedRegion(value);
    setSelectedCity(
      regions.find((item) => item.name === value)?.capitals[0] || "",
    );
  };
  return (
    <main className="dashboard-page container city-screen">
      <div className="page-heading">
        <div>
          <div className="section-kicker">CIDADE E REGIÃO</div>
          <h1>Escolha onde você está</h1>
          <p>
            Selecione uma região, estado e cidade. Temos capitais e municípios
            do interior.
          </p>
        </div>
      </div>
      <div className="city-selection-panel">
        <div className="selection-step">
          <span>1</span>
          <label htmlFor="region-screen">Região</label>
          <select
            id="region-screen"
            value={selectedRegion}
            onChange={(event) => selectRegion(event.target.value)}
          >
            {regions.map((item) => (
              <option key={item.name}>{item.name}</option>
            ))}
          </select>
        </div>
        <div className="selection-step">
          <span>2</span>
          <label htmlFor="city-screen">Cidade</label>
          <select
            id="city-screen"
            value={selectedCity}
            onChange={(event) => setSelectedCity(event.target.value)}
          >
            {[...region.capitals, ...region.interior].map((city) => (
              <option key={city}>{city}</option>
            ))}
          </select>
        </div>
        <div className="selected-place">
          <MapPin size={20} />
          <div>
            <small>Você está em</small>
            <strong>
              {selectedCity} · {selectedRegion}
            </strong>
          </div>
        </div>
      </div>
      <div className="region-cards">
        {regions.map((item) => (
          <button
            className={
              selectedRegion === item.name
                ? "region-card selected"
                : "region-card"
            }
            key={item.name}
            onClick={() => selectRegion(item.name)}
          >
            <span className="region-number">
              {item.capitals.length + item.interior.length}
            </span>
            <strong>{item.name}</strong>
            <small>
              {item.capitals.length} capitais · {item.interior.length} cidades
              do interior
            </small>
            <ChevronRight size={18} />
          </button>
        ))}
      </div>
      <div className="city-tip">
        <Lightbulb size={20} />
        <div>
          <strong>Encontre sua cidade</strong>
          <p>
            Não encontrou? Escolha a região mais próxima e fale com a prefeitura
            pelo formulário de ocorrência.
          </p>
        </div>
      </div>
    </main>
  );
}
