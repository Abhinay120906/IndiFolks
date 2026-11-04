import mongoose from 'mongoose';

const gallerySchema = new mongoose.Schema({
  url: { type: String, required: true },
  publicId: String,
  type: { type: String, enum: ['image', 'video'], default: 'image' },
  title: String
}, { _id: true });

const reviewSchema = new mongoose.Schema({
  customer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name: String,
  rating: { type: Number, min: 1, max: 5, required: true },
  comment: { type: String, maxlength: 1000, default: '' }
}, { timestamps: true });

const packageSchema = new mongoose.Schema({
  name: { type: String, required: true },
  duration: String,
  description: String,
  price: { type: Number, min: 0, required: true }
}, { _id: true });

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true, maxlength: 100 },
  email: { type: String, required: true, trim: true, lowercase: true, unique: true, index: true },
  passwordHash: { type: String, required: true, select: false },
  role: { type: String, enum: ['customer', 'artist', 'admin'], default: 'customer', required: true },
  profileImage: { type: String, default: '' },
  profileImagePublicId: String,
  bio: { type: String, maxlength: 3000, default: '' },
  state: { type: String, trim: true, default: '' },
  specialty: { type: String, trim: true, default: '' },
  artForm: { type: String, trim: true, default: '' },
  awards: { type: String, trim: true, default: '' },
  story: { type: String, maxlength: 5000, default: '' },
  experience: { type: String, default: '' },
  price: { type: Number, min: 0, default: 0 },
  available: { type: Boolean, default: true },
  approvalStatus: { type: String, enum: ['draft', 'pending', 'approved', 'rejected'], default: 'draft' },
  isApproved: { type: Boolean, default: false },
  gallery: { type: [gallerySchema], default: [] },
  pricing: {
    packages: { type: [packageSchema], default: [] },
    addOns: { type: [mongoose.Schema.Types.Mixed], default: [] }
  },
  reviews: { type: [reviewSchema], default: [] }
}, { timestamps: true });

userSchema.set('toJSON', {
  transform(_doc, ret) {
    delete ret.passwordHash;
    delete ret.profileImagePublicId;
    if (Array.isArray(ret.gallery)) ret.gallery = ret.gallery.map(g => {
      delete g.publicId;
      return g;
    });
    return ret;
  }
});
export const User = mongoose.model('User', userSchema);
