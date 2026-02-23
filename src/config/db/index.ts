import mongoose from "mongoose";

export class Database {
  private mongodbConnection: mongoose.Mongoose | null = null;
  private readonly dbUri: string;

  constructor(dbUri: string) {
    this.dbUri = dbUri;
  }

  /**
   * Connects to MongoDB with error handling
   */
  connectMongodb = async (): Promise<mongoose.Mongoose> => {
    try {
      if (this.mongodbConnection) {
        return this.mongodbConnection;
      }

      const connection = await mongoose.connect(this.dbUri);
      
      console.log('Connection with MongoDB database is successful');
      
      // Listen for connection errors after initial connection
      mongoose.connection.on('error', (err) => {
        console.error('MongoDB runtime error:', err);
      });

      this.mongodbConnection = connection;
      return connection;
    } catch (error) {
      console.error(' MongoDB connection failed:', error);
      process.exit(1);
    }
  }

  /**
   * Returns the current connection or null
   */
  getMongodbConnection = (): mongoose.Mongoose | null => {
    return this.mongodbConnection;
  }
}