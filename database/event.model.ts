import mongoose, { Document, Model, Schema } from 'mongoose';

export interface IEvent extends Document {
    title: string;
    slug: string;
    description: string;
    overview: string;
    image: string;
    venue: string;
    location: string;
    date: string;
    time: string;
    mode: string;
    audience: string;
    agenda: string[];
    organizer: string;
    tags: string[];
    createdAt: Date;
    updatedAt: Date;
}

const eventSchema = new Schema<IEvent>(
    {
        title: {
            type: String,
            required: [true, 'Title is rqeuired'],
            trim: true,
        },
        slug: {
            type: String,
            unique: true,
        },
        description: {
            type: String,
            required: [true, 'Description is required'],
            trim: true
        },
        overview: {
            type: String,
            required: [true, 'Overview is required'],
            trim: true
        },
        image: {
            type: String,
            required: [true, 'Image URL is required'],
            trim: true
        },
        venue: {
            type: String,
            required: [true, 'Venue is required'],
            trim: true
        },
        location: {
            type: String,
            required: [true, 'Location is required'],
            trim: true
        },
        date: {
            type: String,
            required: [true, 'Date is required'],
        },
        time: {
            type: String,
            required: [true, 'Time is required'],
        },
        mode: {
            type: String,
            required: [true, 'Mode is required'],
            enum: {
                values: ['online', 'offline', 'hybrid'],
                message: 'Mode must be online, offline, or hybrid',
            },
            trim: true,
            lowercase: true
        },
        audience: {
            type: String,
            required: [true, 'Audience is required'],
            trim: true
        },
        agenda: {
            type: [String],
            required: [true, 'Agenda is required'],
            validate: {
                validator: (v: string[]) => Array.isArray(v) && v.length > 0,
                message: 'Agenda must contain at least one item'
            }
        },
        organizer: {
            type: String,
            required: [true, 'Orgainzer is required'],
            trim: true
        },
        tags: {
            type: [String],
            required: [true, 'Tags are required'],
            validate: {
                validator: (v: string[]) => Array.isArray(v) && v.length > 0,
                message: 'At least one tag is required',
            }
        }
    },
    {
        timestamps:true
    }
);

eventSchema.pre('save', function(){


    if(this.isModified('title')){
        this.slug=generateSlug(this.title);
    }

    if(this.isModified('date')){
        this.date=normalizeDateToISO(this.date);
    }

    if(this.isModified('time')){
        this.time=normalizeTime(this.time);
    }
});

function generateSlug(title:string): string{
    return title.toLowerCase().trim().replace(/[^\w\s-]/g,'').replace(/\s+/g, '-').replace(/-+/g, '-').replace(/^-+|-+$/g, '') 
}

function normalizeDateToISO(dateString: string): string{
    const date=new Date(dateString);

    if(isNaN(date.getTime())){
        throw new Error('Invalid date format. Please provide a valid date.');
    }

    return date.toISOString().split('T')[0];
}

function normalizeTime(timeString: string):string{
    const trimmedTime=timeString.trim();

    const time24HourRegex = /^([0-1]?[0-9]|2[0-3]):([0-5][0-9])$/;

    if(time24HourRegex.test(trimmedTime)){
        const [hours, minutes]=trimmedTime.split(':');
        return `${hours.padStart(2, '0')}:${minutes}`;
    }

    const time12HourRegex = /^(1[0-2]|0?[1-9]):([0-5][0-9])\s*(AM|PM)$/i;
    const match= trimmedTime.match(time12HourRegex);

    if(match){
        let hours=parseInt(match[1], 10);
        const minutes=match[2];
        const period=match[3].toUpperCase();

        if(period === 'PM' && hours !== 12){
            hours+=12;
        } else if(period==='AM' && hours===12){
            hours=0;
        }

        return `${hours.toString().padStart(2, '0')}:${minutes}`;
    }

    throw new Error(
        'Invalid time format. Please use HH:MM (24 hour) or HH:MM Am/PM (12-hour) format.'
    );
}


eventSchema.index({slug:1}, {unique: true});
eventSchema.index({ date:1 });
eventSchema.index({ tags:1 });

const Event:Model<IEvent>= mongoose.models.Event || mongoose.model<IEvent>('Event', eventSchema);

export default Event;
