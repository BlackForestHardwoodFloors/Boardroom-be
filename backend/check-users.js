require('dotenv').config();
const mysql = require('mysql2/promise');

async function addContacts() {
  try {
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_DATABASE
    });

    console.log('Connected to database!\n');
    const now = new Date().toISOString().slice(0, 19).replace('T', ' ');

    // ============ ADD CONTACTS (CLIENTS) ============
    console.log('Adding clients/contacts...');
    
    const contacts = [
      { firstName: 'John', lastName: 'Anderson', company: 'Anderson Residence', email: 'john.anderson@email.com', phone: '509-555-2001' },
      { firstName: 'Emily', lastName: 'Chen', company: 'Chen Family Home', email: 'emily.chen@email.com', phone: '509-555-2002' },
      { firstName: 'Robert', lastName: 'Wilson', company: 'Wilson Office Building', email: 'robert.wilson@email.com', phone: '509-555-2003' },
      { firstName: 'Maria', lastName: 'Garcia', company: 'Garcia Residence', email: 'maria.garcia@email.com', phone: '509-555-2004' },
      { firstName: 'James', lastName: 'Taylor', company: 'Taylor Commercial', email: 'james.taylor@email.com', phone: '509-555-2005' },
    ];

    for (const contact of contacts) {
      await connection.execute(
        `INSERT INTO contacts (id, \`Client Source\`, \`Client Details Availability\`, \`First Name\`, \`Last Name\`, \`Company Name\`, \`Email\`, \`Phone\`, \`Operations Manager\`, \`Created By\`, \`Created Time\`, \`Modified By\`, \`Modified Time\`) 
         VALUES (NULL, 'Direct', 'Yes', ?, ?, ?, ?, ?, 1, 'System', ?, 'System', ?)`,
        [contact.firstName, contact.lastName, contact.company, contact.email, contact.phone, now, now]
      );
      console.log(`  ✓ Added client: ${contact.firstName} ${contact.lastName} (${contact.company})`);
    }

    console.log('\n========================================');
    console.log('SUCCESS! Sample clients added:');
    console.log('- 5 Clients/Contacts');
    console.log('========================================');

    await connection.end();
  } catch (error) {
    console.error('Error:', error.message);
  }
}

addContacts();