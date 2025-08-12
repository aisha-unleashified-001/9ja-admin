import type { Contact, WaitlistEntry } from '../types/api';

export function downloadCSV(data: string, filename: string) {
  const blob = new Blob([data], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  
  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}

export function contactsToCSV(contacts: Contact[]): string {
  const headers = ['ID', 'Full Name', 'Email', 'Subject', 'Message', 'Created At'];
  
  const csvContent = [
    headers.join(','),
    ...contacts.map(contact => [
      contact.id,
      `"${contact.fullName.replace(/"/g, '""')}"`,
      contact.email,
      `"${contact.subject.replace(/"/g, '""')}"`,
      `"${contact.message.replace(/"/g, '""')}"`,
      new Date(contact.createdAt).toLocaleString()
    ].join(','))
  ].join('\n');
  
  return csvContent;
}

export function waitlistToCSV(waitlist: WaitlistEntry[]): string {
  const headers = [
    'ID',
    'Business Name', 
    'Full Name',
    'Email',
    'Phone',
    'Business Type',
    'State of Operation',
    'Product Categories',
    'Product Origin',
    'Online Presence',
    'Online Platforms',
    'Special Handling',
    'Receive Notifications',
    'Message',
    'Created At'
  ];
  
  const csvContent = [
    headers.join(','),
    ...waitlist.map(entry => {
      const businessName = entry.business_name || entry.businessName || '';
      const fullName = entry.full_name || entry.fullName || '';
      const email = entry.email_address || entry.emailAddress || '';
      const phone = entry.phone_number || entry.phoneNumber || '';
      const businessType = entry.business_type || entry.businessType || '';
      const stateOfOperation = entry.state_of_operation || entry.stateOfOperation || '';
      const productCategories = entry.product_categories || entry.productCategories || '';
      const productOrigin = entry.product_origin || entry.productOrigin || '';
      const onlinePresence = entry.online_presence || entry.onlinePresence || '';
      const onlinePlatforms = entry.online_platforms || entry.onlinePlatforms || '';
      const specialHandling = entry.special_handling || entry.specialHandling || '';
      const receiveNotification = entry.receive_notification || entry.receiveNotification || '';
      const message = entry.message || '';
      const createdAt = entry.created_at || entry.createdAt || '';
      
      return [
        entry.id,
        `"${businessName.replace(/"/g, '""')}"`,
        `"${fullName.replace(/"/g, '""')}"`,
        email,
        phone,
        `"${businessType.replace(/"/g, '""')}"`,
        `"${stateOfOperation.replace(/"/g, '""')}"`,
        `"${productCategories.replace(/"/g, '""')}"`,
        `"${productOrigin.replace(/"/g, '""')}"`,
        `"${onlinePresence.replace(/"/g, '""')}"`,
        `"${onlinePlatforms.replace(/"/g, '""')}"`,
        `"${specialHandling.replace(/"/g, '""')}"`,
        `"${receiveNotification.replace(/"/g, '""')}"`,
        `"${message.replace(/"/g, '""')}"`,
        new Date(createdAt).toLocaleString()
      ].join(',');
    })
  ].join('\n');
  
  return csvContent;
}