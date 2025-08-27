import jsPDF from 'jspdf';
export interface StatsData {
  totalTalents: number;
  talentsMet: number;
  selectedTalents: number;
  talents3StarsPlus: number;
  talents5Stars: number;
  attendanceRate: number;
  selectionRate: number;
  selectionFromAttendedRate: number | string;
  averageRating: number;
  establishments: Array<{ talent_id__etablissement: string; count: number }>;
  filieres: Array<{ talent_id__filiere: string; count: number }>;
  noShowRate: number | string;
  conversionRate: number | string;
}

export interface EventInfo {
  title: string;
  start_date: string;
  end_date: string;
  location?: string;
  is_online: boolean;
}

export const generateStatsPDF = async (
  statsData: StatsData,
  eventInfo: EventInfo,
  rawStatsData?: any
) => {
  try {
    const pdf = new jsPDF('p', 'mm', 'a4');
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    let yPosition = 20;

    // Add title
    pdf.setFontSize(20);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Rapport Statistiques - Événement', pageWidth / 2, yPosition, { align: 'center' });
    yPosition += 15;

    // Event information
    pdf.setFontSize(16);
    pdf.setFont('helvetica', 'bold');
    pdf.text(eventInfo.title, pageWidth / 2, yPosition, { align: 'center' });
    yPosition += 10;

    pdf.setFontSize(12);
    pdf.setFont('helvetica', 'normal');
    const eventDate = new Date(eventInfo.start_date).toLocaleDateString('fr-FR');
    const endDate = new Date(eventInfo.end_date).toLocaleDateString('fr-FR');
    pdf.text(`Date: ${eventDate} - ${endDate}`, pageWidth / 2, yPosition, { align: 'center' });
    yPosition += 8;

    if (eventInfo.location) {
      pdf.text(`Lieu: ${eventInfo.location}`, pageWidth / 2, yPosition, { align: 'center' });
    } else if (eventInfo.is_online) {
      pdf.text('Événement en ligne', pageWidth / 2, yPosition, { align: 'center' });
    }
    yPosition += 15;

    // Section: Vue d'ensemble
    pdf.setFontSize(16);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Vue d\'ensemble', 20, yPosition);
    yPosition += 10;

    pdf.setFontSize(11);
    pdf.setFont('helvetica', 'normal');
    
    const overviewData = [
      ['Métrique', 'Valeur'],
      ['Total des inscrits', statsData.totalTalents.toString()],
      ['Talents présents', statsData.talentsMet.toString()],
      ['Talents sélectionnés', statsData.selectedTalents.toString()],
      ['Taux de présence', `${statsData.attendanceRate}%`],
      ['Taux de sélection (présents)', `${statsData.selectionFromAttendedRate}%`],
      ['Taux d\'absence', `${statsData.noShowRate}%`],
      ['Note moyenne', `${statsData.averageRating}/5`],
    ];

    // Create table
    const startX = 20;
    const colWidth = (pageWidth - 40) / 2;
    const rowHeight = 8;

    overviewData.forEach((row, index) => {
      if (index === 0) {
        pdf.setFont('helvetica', 'bold');
        pdf.setFillColor(59, 130, 246); // Blue background
        pdf.rect(startX, yPosition - 2, colWidth * 2, rowHeight, 'F');
        pdf.setTextColor(255, 255, 255); // White text
      } else {
        pdf.setFont('helvetica', 'normal');
        pdf.setTextColor(0, 0, 0); // Black text
        if (index % 2 === 0) {
          pdf.setFillColor(248, 250, 252); // Light gray background
          pdf.rect(startX, yPosition - 2, colWidth * 2, rowHeight, 'F');
        }
      }

      pdf.text(row[0], startX + 2, yPosition + 3);
      pdf.text(row[1], startX + colWidth + 2, yPosition + 3);
      yPosition += rowHeight;
    });

    yPosition += 10;

    // Section: Établissements
    if (statsData.establishments.length > 0) {
      pdf.setFontSize(16);
      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor(0, 0, 0);
      pdf.text('Top 5 - Établissements', 20, yPosition);
      yPosition += 10;

      pdf.setFontSize(11);
      pdf.setFont('helvetica', 'normal');
      
      const establishmentData = [
        ['Établissement', 'Participants'],
        ...statsData.establishments.slice(0, 5).map(est => [
          est.talent_id__etablissement || 'Non spécifié',
          est.count.toString()
        ])
      ];

      establishmentData.forEach((row, index) => {
        if (index === 0) {
          pdf.setFont('helvetica', 'bold');
          pdf.setFillColor(16, 185, 129); // Green background
          pdf.rect(startX, yPosition - 2, colWidth * 2, rowHeight, 'F');
          pdf.setTextColor(255, 255, 255);
        } else {
          pdf.setFont('helvetica', 'normal');
          pdf.setTextColor(0, 0, 0);
          if (index % 2 === 0) {
            pdf.setFillColor(248, 250, 252);
            pdf.rect(startX, yPosition - 2, colWidth * 2, rowHeight, 'F');
          }
        }

        // Truncate long establishment names
        const maxEstablishmentLength = 35;
        const establishmentName = row[0].length > maxEstablishmentLength 
          ? row[0].substring(0, maxEstablishmentLength) + '...' 
          : row[0];

        pdf.text(establishmentName, startX + 2, yPosition + 3);
        pdf.text(row[1], startX + colWidth + 2, yPosition + 3);
        yPosition += rowHeight;
      });

      yPosition += 10;
    }

    // Section: Filières
    if (statsData.filieres.length > 0) {
      // Check if we need a new page
      if (yPosition > pageHeight - 80) {
        pdf.addPage();
        yPosition = 20;
      }

      pdf.setFontSize(16);
      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor(0, 0, 0);
      pdf.text('Top 5 - Filières', 20, yPosition);
      yPosition += 10;

      pdf.setFontSize(11);
      pdf.setFont('helvetica', 'normal');
      
      const filiereData = [
        ['Filière', 'Participants'],
        ...statsData.filieres.slice(0, 5).map(fil => [
          fil.talent_id__filiere || 'Non spécifié',
          fil.count.toString()
        ])
      ];

      filiereData.forEach((row, index) => {
        if (index === 0) {
          pdf.setFont('helvetica', 'bold');
          pdf.setFillColor(139, 92, 246); // Purple background
          pdf.rect(startX, yPosition - 2, colWidth * 2, rowHeight, 'F');
          pdf.setTextColor(255, 255, 255);
        } else {
          pdf.setFont('helvetica', 'normal');
          pdf.setTextColor(0, 0, 0);
          if (index % 2 === 0) {
            pdf.setFillColor(248, 250, 252);
            pdf.rect(startX, yPosition - 2, colWidth * 2, rowHeight, 'F');
          }
        }

        // Truncate long filiere names
        const maxFiliereLength = 35;
        const filiereName = row[0].length > maxFiliereLength 
          ? row[0].substring(0, maxFiliereLength) + '...' 
          : row[0];

        pdf.text(filiereName, startX + 2, yPosition + 3);
        pdf.text(row[1], startX + colWidth + 2, yPosition + 3);
        yPosition += rowHeight;
      });

      yPosition += 10;
    }

    // Section: Comparaison historique (if available)
    if (rawStatsData?.historical_comparison?.previous_events?.length > 0) {
      // Check if we need a new page
      if (yPosition > pageHeight - 60) {
        pdf.addPage();
        yPosition = 20;
      }

      pdf.setFontSize(16);
      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor(0, 0, 0);
      pdf.text('Comparaison Historique', 20, yPosition);
      yPosition += 10;

      pdf.setFontSize(11);
      pdf.setFont('helvetica', 'normal');
      
      const historicalData = [
        ['Événement', 'Participants', 'Taux Présence', 'Taux Sélection'],
        ...rawStatsData.historical_comparison.previous_events.slice(0, 3).map((event: any) => [
          event.title.length > 20 ? event.title.substring(0, 20) + '...' : event.title,
          event.total_participants.toString(),
          `${event.attendance_rate}%`,
          `${event.selection_rate}%`
        ])
      ];

      const hist_colWidth = (pageWidth - 40) / 4;

      historicalData.forEach((row, index) => {
        if (index === 0) {
          pdf.setFont('helvetica', 'bold');
          pdf.setFillColor(245, 158, 11); // Orange background
          pdf.rect(startX, yPosition - 2, hist_colWidth * 4, rowHeight, 'F');
          pdf.setTextColor(255, 255, 255);
        } else {
          pdf.setFont('helvetica', 'normal');
          pdf.setTextColor(0, 0, 0);
          if (index % 2 === 0) {
            pdf.setFillColor(248, 250, 252);
            pdf.rect(startX, yPosition - 2, hist_colWidth * 4, rowHeight, 'F');
          }
        }

        pdf.text(row[0], startX + 2, yPosition + 3);
        pdf.text(row[1], startX + hist_colWidth + 2, yPosition + 3);
        pdf.text(row[2], startX + hist_colWidth * 2 + 2, yPosition + 3);
        pdf.text(row[3], startX + hist_colWidth * 3 + 2, yPosition + 3);
        yPosition += rowHeight;
      });
    }

    // Footer
    yPosition = pageHeight - 20;
    pdf.setFontSize(8);
    pdf.setFont('helvetica', 'normal');
    pdf.setTextColor(128, 128, 128);
    pdf.text('Généré le ' + new Date().toLocaleDateString('fr-FR'), 20, yPosition);
    pdf.text('JobGate - Plateforme de Recrutement', pageWidth - 20, yPosition, { align: 'right' });

    // Save the PDF
    const fileName = `stats_${eventInfo.title.replace(/[^a-zA-Z0-9]/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`;
    pdf.save(fileName);

    return true;
  } catch (error) {
    console.error('Error generating PDF:', error);
    throw error;
  }
};

