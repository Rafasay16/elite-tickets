import dotenv from 'dotenv';
dotenv.config();

export class TMDBService {
  private static readonly TMDB_API_KEY = process.env.TMDB_API_KEY;

  static mapCertification(cert?: string): string {
    if (!cert) return '14'; // Padrão se não achar
    
    const cleanCert = cert.trim().toUpperCase();
    if (cleanCert === 'L') return 'Livre';
    if (cleanCert === '10') return '10';
    if (cleanCert === '12') return '12';
    if (cleanCert === '14') return '14';
    if (cleanCert === '16') return '16';
    if (cleanCert === '18') return '18';
    
    return '14'; // Padrão seguro
  }

  static async getMovieRating(tmdbId: string): Promise<string> {
    if (!this.TMDB_API_KEY) {
      console.error("ERRO: TMDB_API_KEY não encontrada no arquivo .env");
      return '14'; // Fallback
    }

    try {
      const response = await fetch(`https://api.themoviedb.org/3/movie/${tmdbId}/release_dates?api_key=${this.TMDB_API_KEY}`);
      if (!response.ok) {
        throw new Error(`TMDB API request failed with status ${response.status}`);
      }
      const releaseData: any = await response.json();
      
      let finalRating = '14'; // fallback

      if (releaseData && releaseData.results) {
        const brRelease = releaseData.results.find((r: any) => r.iso_3166_1 === 'BR');
        if (brRelease && brRelease.release_dates && brRelease.release_dates.length > 0) {
          // Pegar a certificação (pode ter múltiplas datas de lançamento no Brasil, pega a primeira que tiver certificação)
          const dateWithCert = brRelease.release_dates.find((d: any) => d.certification);
          if (dateWithCert && dateWithCert.certification) {
            finalRating = this.mapCertification(dateWithCert.certification);
          }
        } else {
           // Tentar usar o do US se não tiver do BR (US: G = Livre, PG = 10, PG-13 = 12/14, R = 16/18)
           const usRelease = releaseData.results.find((r: any) => r.iso_3166_1 === 'US');
           if (usRelease && usRelease.release_dates && usRelease.release_dates.length > 0) {
             const dateWithCert = usRelease.release_dates.find((d: any) => d.certification);
             if (dateWithCert && dateWithCert.certification) {
               const usCert = dateWithCert.certification;
               if (usCert === 'G' || usCert === 'PG') finalRating = 'Livre';
               else if (usCert === 'PG-13') finalRating = '12';
               else if (usCert === 'R' || usCert === 'NC-17') finalRating = '16';
             }
           }
        }
      }
      return finalRating;
    } catch (err) {
      console.error(`Erro ao buscar classificação do TMDB ID ${tmdbId}:`, err);
      return '14'; // Falha
    }
  }
}
