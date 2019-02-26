const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const Schema = mongoose.Schema;

const LandlordSchema = new Schema({
  createdAt       : { type: Date },
  updatedAt       : { type: Date },
  password        : { type: String, select: false, required: true },
  username        : { type: String, required: true, unique: true },
  rentals         : [{type: Schema.Types.ObjectId, ref: "Rental"}]

});

// Must use function here! ES6 => functions do not bind this!
LandlordSchema.pre("save", function(next) {
    //SET createdAt && updatedAt
    const now = new Date();
    this.updatedAt = now;
    if (!this.createdAt) {
        this.createdAt = now;
    }

    // ENCRYPT Password
    const user = this;
    if (!user.isModified("password")) {
        return next();
    }
    bcrypt.genSalt(10, (err, salt) => {
        bcrypt.hash(user.password, salt, (err, hash) => {
            user.password = hash;
            next();
        });
    });
});

LandlordSchema.methods.comparePassword = function(password, done) {
    bcrypt.compare(password, this.password, (err, isMatch) => {
        done(err, isMatch);
    });
};




module.exports = mongoose.model('Landlord', LandlordSchema);
