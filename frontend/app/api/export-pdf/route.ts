import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase-server';

// Generate printable HTML for PDF export
// Client can use window.print() or browser's "Save as PDF" feature
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const bookingId = searchParams.get('booking_id');
    const vendorId = searchParams.get('vendor_id');
    const exportType = searchParams.get('type') || 'full'; // full, timeline, checklist, etc.

    if (!bookingId || !vendorId) {
      return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 });
    }

    // Get vendor's export preferences
    const { data: vendorRoles } = await supabaseServer
      .from('wedding_vendor_roles')
      .select('export_preferences, enabled_tools')
      .eq('booking_id', bookingId)
      .eq('vendor_id', vendorId)
      .single();

    const exportPrefs = vendorRoles?.export_preferences || {
      include_timeline: true,
      include_checklist: true,
      include_role_specific: true
    };

    // Get booking details
    const { data: booking } = await supabaseServer
      .from('vendor_bookings')
      .select('*, vendors(*)')
      .eq('id', bookingId)
      .single();

    if (!booking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
    }

    // Get project
    const { data: project } = await supabaseServer
      .from('wedding_projects')
      .select('id')
      .eq('booking_id', bookingId)
      .single();

    const projectId = project?.id;

    // Build HTML document
    let html = generateHTMLHeader(booking);

    // Add timeline
    if (exportPrefs.include_timeline && projectId) {
      const { data: timeline } = await supabaseServer
        .from('wedding_timeline')
        .select('*')
        .eq('project_id', projectId)
        .eq('vendor_id', vendorId)
        .order('time_slot', { ascending: true });

      if (timeline && timeline.length > 0) {
        html += generateTimelineSection(timeline);
      }
    }

    // Add checklist
    if (exportPrefs.include_checklist && projectId) {
      const { data: checklist } = await supabaseServer
        .from('wedding_info_checklist')
        .select('*')
        .eq('project_id', projectId)
        .order('priority', { ascending: false });

      if (checklist && checklist.length > 0) {
        html += generateChecklistSection(checklist);
      }
    }

    html += generateHTMLFooter();

    return new NextResponse(html, {
      headers: {
        'Content-Type': 'text/html',
        'Content-Disposition': `inline; filename="wedding_${booking.bride_name}_${new Date().toISOString().split('T')[0]}.html"`
      }
    });
  } catch (error) {
    console.error('PDF export error:', error);
    return NextResponse.json({ error: 'Failed to generate export' }, { status: 500 });
  }
}

// Generate HTML header with styles
function generateHTMLHeader(booking: any): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Wedding Plan - ${booking.bride_name}</title>
  <style>
    @media print {
      @page {
        margin: 0.75in;
        size: letter;
      }
      .no-print {
        display: none;
      }
    }
    body {
      font-family: 'Georgia', 'Times New Roman', serif;
      line-height: 1.6;
      color: #333;
      max-width: 8.5in;
      margin: 0 auto;
      padding: 20px;
    }
    .header {
      text-align: center;
      border-bottom: 3px solid #8B4789;
      padding-bottom: 20px;
      margin-bottom: 30px;
    }
    .header h1 {
      color: #8B4789;
      font-size: 32px;
      margin: 0;
      font-weight: normal;
    }
    .header .subtitle {
      color: #666;
      font-size: 18px;
      margin-top: 10px;
    }
    .section {
      margin-bottom: 40px;
      page-break-inside: avoid;
    }
    .section-title {
      color: #8B4789;
      font-size: 24px;
      border-bottom: 2px solid #D97757;
      padding-bottom: 8px;
      margin-bottom: 20px;
    }
    .timeline-event {
      border-left: 4px solid #8B4789;
      padding-left: 20px;
      margin-bottom: 20px;
      page-break-inside: avoid;
    }
    .timeline-event .time {
      color: #8B4789;
      font-weight: bold;
      font-size: 16px;
    }
    .timeline-event .activity {
      font-size: 18px;
      margin: 5px 0;
    }
    .timeline-event .details {
      color: #666;
      font-size: 14px;
    }
    .checklist-item {
      padding: 10px;
      margin-bottom: 10px;
      border-left: 3px solid #ccc;
      page-break-inside: avoid;
    }
    .checklist-item.completed {
      border-left-color: #10b981;
      color: #666;
    }
    .checklist-item.urgent {
      border-left-color: #ef4444;
    }
    .checklist-item.high {
      border-left-color: #f59e0b;
    }
    .checkbox {
      display: inline-block;
      width: 16px;
      height: 16px;
      border: 2px solid #333;
      margin-right: 10px;
      vertical-align: middle;
    }
    .checkbox.checked {
      background: #10b981;
      border-color: #10b981;
    }
    .footer {
      margin-top: 50px;
      padding-top: 20px;
      border-top: 2px solid #ccc;
      text-align: center;
      color: #999;
      font-size: 12px;
    }
    .print-button {
      background: linear-gradient(to right, #8B4789, #D97757);
      color: white;
      padding: 12px 24px;
      border: none;
      border-radius: 8px;
      font-size: 16px;
      cursor: pointer;
      margin: 20px 0;
    }
    .print-button:hover {
      opacity: 0.9;
    }
  </style>
</head>
<body>
  <div class="no-print" style="text-align: center;">
    <button class="print-button" onclick="window.print()">🖨️ Print / Save as PDF</button>
  </div>

  <div class="header">
    <h1>${booking.bride_name}'s Wedding</h1>
    <div class="subtitle">
      ${new Date(booking.wedding_date).toLocaleDateString('en-US', {
        weekday: 'long',
        month: 'long',
        day: 'numeric',
        year: 'numeric'
      })}
    </div>
    <div class="subtitle">${booking.venue || 'Venue TBD'}</div>
    <div class="subtitle">Prepared by ${booking.vendors?.business_name || 'Vendor'}</div>
    <div class="subtitle" style="font-size: 14px; color: #999; margin-top: 10px;">
      Generated: ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}
    </div>
  </div>
`;
}

// Generate timeline section
function generateTimelineSection(timeline: any[]): string {
  let html = `
  <div class="section">
    <h2 class="section-title">Wedding Day Timeline</h2>
`;

  timeline.forEach((event: any) => {
    const startTime = event.time_slot;
    const endTime = new Date(`2000-01-01T${event.time_slot}`);
    endTime.setMinutes(endTime.getMinutes() + (event.duration_minutes || 0));
    const endTimeStr = endTime.toTimeString().slice(0, 5);

    html += `
    <div class="timeline-event">
      <div class="time">${startTime} - ${endTimeStr} (${event.duration_minutes} min)</div>
      <div class="activity">${event.activity}</div>
      ${event.location ? `<div class="details">📍 ${event.location}</div>` : ''}
      ${event.notes ? `<div class="details">${event.notes}</div>` : ''}
    </div>
`;
  });

  html += `  </div>`;
  return html;
}

// Generate checklist section
function generateChecklistSection(checklist: any[]): string {
  let html = `
  <div class="section">
    <h2 class="section-title">Information Needed</h2>
`;

  const priorities = ['urgent', 'high', 'medium', 'low'];
  priorities.forEach(priority => {
    const items = checklist.filter((item: any) => item.priority === priority);
    if (items.length > 0) {
      html += `<h3 style="color: #666; margin-top: 20px;">${priority.toUpperCase()} Priority</h3>`;
      items.forEach((item: any) => {
        html += `
    <div class="checklist-item ${item.is_completed ? 'completed' : ''} ${item.priority}">
      <span class="checkbox ${item.is_completed ? 'checked' : ''}"></span>
      <strong>${item.item_name}</strong>
      ${item.description ? `<div style="margin-left: 26px; margin-top: 5px;">${item.description}</div>` : ''}
    </div>
`;
      });
    }
  });

  html += `  </div>`;
  return html;
}

// Generate HTML footer
function generateHTMLFooter(): string {
  return `
  <div class="footer">
    <p>This document was generated by Bella Wedding Platform</p>
    <p>For the best experience, print this page or use your browser's "Save as PDF" feature</p>
  </div>

  <div class="no-print" style="text-align: center; margin-top: 30px;">
    <button class="print-button" onclick="window.print()">🖨️ Print / Save as PDF</button>
  </div>
</body>
</html>
`;
}
