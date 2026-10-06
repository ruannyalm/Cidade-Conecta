"use client";

import {
  Check,
  FileText,
  ImagePlus,
  LoaderCircle,
  MapPin,
  Mic,
  ShieldCheck,
  Sparkles,
  Trash2,
  X,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { createOccurrence } from "../../lib/api";

export type ReportTab = "voz" | "texto" | "midia" | "identidade";

type SpeechResult = { 0: { transcript: string } };
type SpeechEvent = { resultIndex: number; results: ArrayLike<SpeechResult> };
type SpeechRecognition = {
  lang: string;
  interimResults: boolean;
  onresult: ((event: SpeechEvent) => void) | null;
  onerror: ((event: { error: string }) => void) | null;
  onend: (() => void) | null;
  start: () => void;
  stop: () => void;
};
type SpeechWindow = Window & {
  SpeechRecognition?: new () => SpeechRecognition;
  webkitSpeechRecognition?: new () => SpeechRecognition;
};

const categories = [
  ["BURACO_VIA", "Buraco na via"],
  ["POSTE_CAIDO", "Poste caído"],
  ["ILUMINACAO_INSUFICIENTE", "Iluminação insuficiente"],
  ["QUEIMADA", "Queimada"],
  ["LIXO_IRREGULAR", "Lixo irregular"],
  ["OUTRO", "Outro problema"],
];

const addressOptions = [
  "Av. Cazuzinha Marques",
  "R. Manuel José",
  "R. Emídio Alves de Almeida",
  "R. Maria Nilce Rodrigues Marquês",
  "R. Dr. Tribúrcio Soares",
  "R. Paulino Felix",
  "Ponto de referência: Igreja da Matriz",
];

export function ModalDeOcorrencia({
  tab,
  setTab,
  onClose,
  notify,
}: {
  tab: ReportTab;
  setTab: (value: ReportTab) => void;
  onClose: () => void;
  notify: (message: string) => void;
}) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("OUTRO");
  const [address, setAddress] = useState("");
  const [neighborhood, setNeighborhood] = useState("");
  const [anonymous, setAnonymous] = useState(false);
  const [media, setMedia] = useState<File[]>([]);
  const [listening, setListening] = useState(false);
  const [recordedSpeech, setRecordedSpeech] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const recognitionRef = useRef<SpeechRecognition | null>(null);

  useEffect(() => {
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        recognitionRef.current?.stop();
        onClose();
      }
    };
    window.addEventListener("keydown", closeOnEscape);
    return () => {
      window.removeEventListener("keydown", closeOnEscape);
      recognitionRef.current?.stop();
    };
  }, [onClose]);

  const toggleRecording = () => {
    if (listening) {
      recognitionRef.current?.stop();
      return;
    }

    const speechApi = window as SpeechWindow;
    const Recognition =
      speechApi.SpeechRecognition || speechApi.webkitSpeechRecognition;
    if (!Recognition) {
      setError(
        "Seu navegador não oferece transcrição de voz. Use a aba Escrever.",
      );
      return;
    }

    setError("");
    const recognition = new Recognition();
    recognition.lang = "pt-BR";
    recognition.interimResults = false;
    recognition.onresult = (event) => {
      let transcript = "";
      for (
        let index = event.resultIndex;
        index < event.results.length;
        index += 1
      ) {
        transcript += event.results[index][0].transcript;
      }
      if (transcript.trim()) {
        setDescription(
          (current) => `${current}${current ? " " : ""}${transcript.trim()}`,
        );
        setRecordedSpeech(true);
      }
    };
    recognition.onerror = (event) => {
      setError(
        event.error === "not-allowed"
          ? "Permita o uso do microfone no navegador para falar."
          : "Não foi possível transcrever a fala. Tente novamente ou escreva o relato.",
      );
      setListening(false);
    };
    recognition.onend = () => setListening(false);
    recognitionRef.current = recognition;
    try {
      recognition.start();
      setListening(true);
    } catch {
      setError("Não foi possível iniciar o microfone. Tente novamente.");
    }
  };

  const addMedia = (files: FileList | null) => {
    if (!files) return;
    const chosen = Array.from(files);
    if (chosen.some((file) => file.size > 80 * 1024 * 1024)) {
      setError("Cada arquivo deve ter no máximo 80 MB.");
      return;
    }
    if (media.length + chosen.length > 5) {
      setError("Você pode anexar no máximo 5 arquivos.");
      return;
    }
    setError("");
    setMedia((current) => [...current, ...chosen]);
  };

  const submitReport = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    if (!description.trim()) {
      setError("Descreva o que aconteceu antes de enviar.");
      return;
    }
    setSubmitting(true);
    try {
      await createOccurrence(
        {
          titulo:
            title.trim() ||
            categories.find(([value]) => value === category)?.[1] ||
            "Ocorrência cidadã",
          descricao: description.trim(),
          categoria: category,
          endereco: address.trim() || undefined,
          bairro: neighborhood.trim() || undefined,
          anonima: anonymous,
          enviadaPorAudio: recordedSpeech,
        },
        media,
      );
      notify("Ocorrência enviada com sucesso.");
      onClose();
    } catch {
      setError(
        "Não foi possível enviar o relato. Verifique sua conexão e tente novamente.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  const selectMedia = () => fileInputRef.current?.click();

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <form
        className="voice-modal report-modal"
        onSubmit={submitReport}
        onClick={(event) => event.stopPropagation()}
      >
        <button
          type="button"
          className="modal-close"
          onClick={onClose}
          aria-label="Fechar"
        >
          <X size={19} />
        </button>
        <div className="modal-icon">
          <Sparkles size={23} />
        </div>
        <div className="section-kicker green">CIDADE CONECTA / NOVO RELATO</div>
        <h2>O que aconteceu?</h2>
        <p>
          Registre uma situação da sua cidade. Revise as informações antes de
          enviar.
        </p>
        <div
          className="report-tabs"
          role="tablist"
          aria-label="Como deseja relatar"
        >
          <button
            type="button"
            className={tab === "voz" ? "report-tab-active" : ""}
            onClick={() => setTab("voz")}
            role="tab"
            aria-selected={tab === "voz"}
          >
            <Mic size={16} /> Falar
          </button>
          <button
            type="button"
            className={tab === "texto" ? "report-tab-active" : ""}
            onClick={() => setTab("texto")}
            role="tab"
            aria-selected={tab === "texto"}
          >
            <FileText size={16} /> Escrever
          </button>
          <button
            type="button"
            className={tab === "midia" ? "report-tab-active" : ""}
            onClick={() => setTab("midia")}
            role="tab"
            aria-selected={tab === "midia"}
          >
            <ImagePlus size={16} /> Mídia
          </button>
          <button
            type="button"
            className={tab === "identidade" ? "report-tab-active" : ""}
            onClick={() => setTab("identidade")}
            role="tab"
            aria-selected={tab === "identidade"}
          >
            <ShieldCheck size={16} /> Identidade
          </button>
        </div>
        {tab === "voz" && (
          <section className="report-mode report-voice-mode">
            <div
              className={`listening-circle ${listening ? "is-listening" : ""}`}
            >
              <Mic size={34} />
            </div>
            <div className="report-mode-copy">
              <strong>
                {listening ? "Estou ouvindo..." : "Conte com suas palavras"}
              </strong>
              <span>
                {listening
                  ? "Fale com clareza; toque para encerrar."
                  : "A fala será transcrita pelo navegador e você poderá revisar."}
              </span>
            </div>
            <button
              className="modal-mic-btn"
              type="button"
              onClick={toggleRecording}
            >
              <Mic size={18} />{" "}
              {listening ? "Encerrar fala" : "Começar a falar"}
            </button>
          </section>
        )}
        {tab === "texto" && (
          <div className="report-mode report-text-mode">
            <FileText size={20} />
            <span>
              Escreva um relato direto: o que ocorreu e como isso afeta a
              região.
            </span>
          </div>
        )}
        {tab === "midia" && (
          <section className="report-mode report-media-mode">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*,video/*"
              multiple
              hidden
              onChange={(event) => addMedia(event.target.files)}
            />
            <button
              type="button"
              className="media-dropzone"
              onClick={selectMedia}
            >
              <ImagePlus size={25} />
              <strong>Adicionar foto ou vídeo</strong>
              <span>Até 5 arquivos, máximo de 80 MB cada</span>
            </button>
            {media.length > 0 && (
              <ul className="selected-media">
                {media.map((file, index) => (
                  <li key={`${file.name}-${index}`}>
                    <span>
                      {file.name}
                      <small>{(file.size / (1024 * 1024)).toFixed(1)} MB</small>
                    </span>
                    <button
                      type="button"
                      aria-label={`Remover ${file.name}`}
                      onClick={() =>
                        setMedia((current) =>
                          current.filter((_, itemIndex) => itemIndex !== index),
                        )
                      }
                    >
                      <Trash2 size={16} />
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </section>
        )}
        {tab === "identidade" && (
          <section className="report-mode report-identity-mode">
            <label
              className={
                !anonymous ? "identity-option selected" : "identity-option"
              }
            >
              <input
                type="radio"
                name="report-identity"
                checked={!anonymous}
                onChange={() => setAnonymous(false)}
              />
              <span>
                <strong>Identificado</strong>
                <small>Seu nome acompanha o relato.</small>
              </span>
              <Check size={17} />
            </label>
            <label
              className={
                anonymous ? "identity-option selected" : "identity-option"
              }
            >
              <input
                type="radio"
                name="report-identity"
                checked={anonymous}
                onChange={() => setAnonymous(true)}
              />
              <span>
                <strong>Anônimo</strong>
                <small>Seu nome não será exibido no relato.</small>
              </span>
              <ShieldCheck size={17} />
            </label>
          </section>
        )}
        <div className="report-fields">
          <div className="report-field-grid">
            <div className="report-field">
              <label htmlFor="report-category">Tipo de ocorrência</label>
              <select
                id="report-category"
                value={category}
                onChange={(event) => setCategory(event.target.value)}
              >
                {categories.map(([value, label]) => (
                  <option value={value} key={value}>
                    {label}
                  </option>
                ))}
              </select>
            </div>
            <div className="report-field">
              <label htmlFor="report-title">Título</label>
              <input
                id="report-title"
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                placeholder="Ex.: Buraco na rua"
                maxLength={120}
              />
            </div>
            <div className="report-field">
              <label htmlFor="report-neighborhood">Bairro</label>
              <input
                id="report-neighborhood"
                value={neighborhood}
                onChange={(event) => setNeighborhood(event.target.value)}
                placeholder="Ex.: Centro"
              />
            </div>
            <div className="report-field">
              <label htmlFor="report-address">Rua ou ponto de referência</label>
              <select
                id="report-address"
                value={address}
                onChange={(event) => setAddress(event.target.value)}
              >
                <option value="">Selecione uma rua ou referência (opcional)</option>
                {addressOptions.map((option) => (
                  <option value={option} key={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="report-field">
            <label htmlFor="report-description">Descrição</label>
            <textarea
              id="report-description"
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              placeholder="Descreva o que aconteceu..."
              rows={3}
              required
            />
          </div>
          {tab !== "identidade" && (
            <label className="report-anonymous-toggle">
              <input
                type="checkbox"
                checked={anonymous}
                onChange={(event) => setAnonymous(event.target.checked)}
              />
              <span>Enviar este relato anonimamente</span>
            </label>
          )}
        </div>
        {error && (
          <p className="report-error" role="alert">
            {error}
          </p>
        )}
        <div className="report-submit-row">
          <span>
            <MapPin size={14} /> A equipe responsável receberá o relato.
          </span>
          <button
            className="primary-btn report-submit"
            type="submit"
            disabled={submitting}
          >
            {submitting ? (
              <LoaderCircle className="spin" size={17} />
            ) : (
              <Check size={17} />
            )}
            {submitting ? "Enviando..." : "Enviar ocorrência"}
          </button>
        </div>
      </form>
    </div>
  );
}
