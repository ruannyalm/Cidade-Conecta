"use client";

import { MapPin } from "lucide-react";

export function CitiesPage() {
  return (
    <main className="dashboard-page container city-screen">
      <div className="page-heading">
        <div>
          <div className="section-kicker">CIDADE ATENDIDA</div>
          <h1>Acopiara · Ceará</h1>
          <p>Consulte as ruas cadastradas para registrar ocorrências no município.</p>
        </div>
      </div>
      <div className="city-selection-panel">
        <div className="selected-place">
          <MapPin size={20} />
          <div>
            <small>Município</small>
            <strong>Acopiara · CE</strong>
          </div>
        </div>
      </div>
    </main>
  );
}
