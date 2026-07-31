import { CONFIG, gruposExpediente, mapaLink, nomeMarca } from '../config.js'

export default function Footer() {
  const grupos = gruposExpediente()
  const temEndereco = CONFIG.endereco || CONFIG.bairro

  return (
    <footer className="rodape" id="contato">
      <div className="container">
        <div className="rodape__grade">
          <div>
            <div className="marca marca--rodape">
              <img className="marca__logo" src="/logo-doncarlos.png" alt={nomeMarca()} />
              <span>
                <span className="marca__l1">
                  {CONFIG.marca.parte1} <em>{CONFIG.marca.parte2}</em>
                </span>
                <span className="marca__l2">{CONFIG.marca.sub}</span>
              </span>
            </div>
            <p>{CONFIG.sobre}</p>
          </div>

          <div>
            <h4>Contato</h4>
            <a href={`https://wa.me/${CONFIG.whatsappNumero}`} target="_blank" rel="noopener noreferrer">
              {CONFIG.whatsappExibicao}
            </a>
            {CONFIG.instagram && (
              <a
                href={`https://instagram.com/${CONFIG.instagram}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                @{CONFIG.instagram}
              </a>
            )}
            {/* o endereço leva direto para o Maps, igual ao botão da seção do mapa */}
            {CONFIG.endereco &&
              (mapaLink ? (
                <a href={mapaLink} target="_blank" rel="noopener noreferrer">
                  {CONFIG.endereco}
                </a>
              ) : (
                <p>{CONFIG.endereco}</p>
              ))}
            {CONFIG.bairro && <p>{CONFIG.bairro}</p>}
            {!temEndereco && <p>Atendimento com hora marcada</p>}
          </div>

          <div>
            <h4>Horário</h4>
            {grupos.map((g) => (
              <p key={g.label}>
                {g.label}: {g.texto}
              </p>
            ))}
            <a href="#agendar">Agendar horário</a>
          </div>
        </div>

        {/* o painel continua em /admin, mas sem link visível: quem administra
            digita o endereço, o cliente não tropeça nele */}
        <div className="rodape__fim">
          © {new Date().getFullYear()} {CONFIG.marca.parte1} {CONFIG.marca.parte2} · Todos os direitos
          reservados
        </div>
      </div>
    </footer>
  )
}
