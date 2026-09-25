import 'dotenv/config';
import { MongoClient, Collection, Db } from 'mongodb';
import dns from 'node:dns';
import type { Registration, RegistrationStatus } from '../app/models/registration.model';

const mongoUri = process.env['MONGODB_URI'] || 'mongodb://127.0.0.1:27017';
const databaseName = process.env['MONGODB_DB'] || 'feria_robotica_nobsa';
const configuredDnsServers = process.env['MONGODB_DNS_SERVERS']
  ?.split(',')
  .map(server => server.trim())
  .filter(Boolean);
const collectionName = 'registrations';

if (configuredDnsServers?.length) {
  dns.setServers(configuredDnsServers);
}

let databasePromise: Promise<Db> | undefined;

const registrationValidator = {
  $jsonSchema: {
    bsonType: 'object',
    required: [
      'id', 'code', 'createdAt', 'category', 'categoryName', 'teamName',
      'projectTitle', 'institution', 'institutionType', 'city', 'department',
      'leaderName', 'leaderDoc', 'leaderEmail', 'leaderPhone', 'members',
      'projectDescription', 'status'
    ],
    properties: {
      id: { bsonType: 'string' },
      code: { bsonType: 'string' },
      createdAt: { bsonType: 'string' },
      category: { enum: ['automatizacion', 'seguidores', 'educativos'] },
      categoryName: { bsonType: 'string' },
      teamName: { bsonType: 'string', minLength: 3 },
      projectTitle: { bsonType: 'string' },
      institution: { bsonType: 'string' },
      institutionType: { enum: ['Colegio / I.E.', 'Universidad / SENA', 'Club / Independiente', 'Empresa / StartUp'] },
      city: { bsonType: 'string' },
      department: { bsonType: 'string' },
      leaderName: { bsonType: 'string' },
      leaderDoc: { bsonType: 'string' },
      leaderEmail: { bsonType: 'string' },
      leaderPhone: { bsonType: 'string' },
      mentorName: { bsonType: 'string' },
      mentorDoc: { bsonType: 'string' },
      members: {
        bsonType: 'array',
        minItems: 1,
        maxItems: 2,
        items: {
          bsonType: 'object',
          required: ['id', 'fullName', 'documentId', 'role'],
          properties: {
            id: { bsonType: 'string' },
            fullName: { bsonType: 'string' },
            documentId: { bsonType: 'string' },
            role: { enum: ['Líder / Capitán', 'Integrante', 'Tutor / Asesor'] },
            email: { bsonType: 'string' },
            phone: { bsonType: 'string' }
          }
        }
      },
      projectDescription: { bsonType: 'string' },
      technicalSpecs: { bsonType: 'string' },
      spaceRequirements: { bsonType: 'string' },
      status: { enum: ['Confirmado', 'En revisión', 'Aprobado', 'Pendiente'] }
    }
  }
};

async function getDatabase(): Promise<Db> {
  if (!databasePromise) {
    const client = new MongoClient(mongoUri, {
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      connectTimeoutMS: 5000
    });

    databasePromise = client.connect().then(async connectedClient => {
      const db = connectedClient.db(databaseName);
      try {
        await db.createCollection(collectionName, {
          validator: registrationValidator,
          validationLevel: 'strict',
          validationAction: 'error'
        });
      } catch (error) {
        if (!(error instanceof Error) || !error.message.includes('already exists')) {
          throw error;
        }
      }

      const registrations = db.collection<Registration>(collectionName);
      await Promise.all([
        registrations.createIndex({ code: 1 }, { unique: true }),
        registrations.createIndex({ leaderDoc: 1 }),
        registrations.createIndex({ 'members.documentId': 1 }),
        registrations.createIndex({ category: 1, status: 1 }),
        registrations.createIndex({ city: 1 })
      ]);
      return db;
    }).catch(error => {
      databasePromise = undefined;
      throw error;
    });
  }

  return databasePromise;
}

export async function registrationsCollection(): Promise<Collection<Registration>> {
  const db = await getDatabase();
  return db.collection<Registration>(collectionName);
}

export async function findRegistrationByCodeOrDocument(value: string): Promise<Registration | null> {
  const registrations = await registrationsCollection();
  const normalizedValue = value.trim();
  return registrations.findOne({
    $or: [
      { code: normalizedValue.toUpperCase() },
      { id: normalizedValue },
      { leaderDoc: normalizedValue },
      { leaderEmail: normalizedValue.toLowerCase() }
    ]
  });
}

export async function hasDuplicateParticipantDocuments(documents: string[], exceptId?: string): Promise<boolean> {
  const registrations = await registrationsCollection();
  const query = {
    $or: [
      { leaderDoc: { $in: documents } },
      { 'members.documentId': { $in: documents } },
      { mentorDoc: { $in: documents } }
    ],
    ...(exceptId ? { id: { $ne: exceptId } } : {})
  };
  return (await registrations.countDocuments(query, { limit: 1 })) > 0;
}

export async function countInstitutionCategoryRegistrations(institution: string, category: Registration['category']): Promise<number> {
  const registrations = await registrationsCollection();
  const escapedInstitution = institution.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return registrations.countDocuments({
    institution: { $regex: `^${escapedInstitution}$`, $options: 'i' },
    category
  });
}

export async function updateRegistrationStatus(id: string, status: RegistrationStatus): Promise<Registration | null> {
  const registrations = await registrationsCollection();
  return registrations.findOneAndUpdate(
    { $or: [{ id }, { code: id }] },
    { $set: { status } },
    { returnDocument: 'after' }
  );
}
