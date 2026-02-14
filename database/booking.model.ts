import mongoose, { Document, Model, Schema} from 'mongoose';
import Event from './event.model';

export interface IBooking extends Document {
    eventId: mongoose.Types.ObjectId,
    email:string,
    createdAt: Date,
    updatedAt: Date
}

const BookingSchema= new Schema<IBooking>({
    eventId:{
        eventId:{
            type:Schema.Types.ObjectId,
            ref:'Event',
            required:[true, 'Event Id is required'],
        },
        email:{
            type:String,
            required:[true, 'Email is required'],
            lowercase: true,
            trim: true,
            validate:{
                validator:function (email:string):boolean{
                    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                    return emailRegex.test(email);
                },
                message:'Please provide a valid email address'
            }
        }
    }
},{timestamps:true});

BookingSchema.pre('save', async function (){
    if(this.isModified('eventId')){
        const eventExists=await Event.findById(this.eventId);
        if(!eventExists){
            throw new Error(
                `Event with ID ${this.eventId} does not exist. Cannot create booking.`
            )
        }
    }
});

// Create compound index for common queries (events bookings by date)
BookingSchema.index({ eventId: 1, createdAt: -1 });

// Create index on email for user booking lookups
BookingSchema.index({ email: 1 });

// Enforce one booking per events per email
BookingSchema.index({ eventId: 1, email: 1 }, { unique: true, name: 'uniq_event_email' });

const Booking:Model<IBooking>=mongoose.models.Booking || mongoose.model<IBooking>('Booking', BookingSchema);

export default Booking;