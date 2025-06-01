const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcrypt');
const Schema = mongoose.Schema;

const userSchema = new Schema({
    name:{
        type:String,
        required:true,
        minlength:4,
        maxlength:25,
        trim:true
    },
    email:{
        type:String,
        required:[true,'Enter Email Address'],
        unique:[true,'Email Already Exist'],
        trim:true,
        validate:{
            validator:validator.isEmail,
            message:'{VALUE} is not a valid email'
        }
    },
    username:{
        type:String,
        required:true,
        unique:true,
        minlength:4,
        maxlength:15,
        trim:true
    },
    mobile:{
        type:Number,
        required:true,
        minlength:10,
        maxlength:13,
    },
    password:{
        type:String,
        required:true,
        minlength:8,
    },
    type:{
        type:String,
        enum:['admin','employee','leader']
    },
    status:{
        type:String,
        enum:['active','banned','provison','notice'],
        default:'active'
    },
    team:{
        type:Schema.Types.ObjectId,
        ref:'Team'
    },
    image:{
        type:String,
        required:false,
        default:'user.png'
    },
    Policeverification:{
        type:String,
        required:false,
        default:'user.png'
    },
    employee_adhar_image:{
        type:String,
        required:false,
        default:'user.png'
    },
    employee_pan_image:{
        type:String,
        required:false,
        default:'user.png'
    },
    mother_adhar_image:{
        type:String,
        required:false,
        default:'user.png'
    },
    father_adhar_image:{
        type:String,
        required:false,
        default:'user.png'
    },
    tenth_marksheet_img:{
        type:String,
        required:false,
        default:'user.png'
    },
    twelth_marksheet_img:{
        type:String,
        required:false,
        default:'user.png'
    },
    current_address:{
        type:String,
        default:'No Address Specified',
        maxlength:100,
        trim:true
    },
    permanent_address:{
        type:String,
        default:'No Address Specified',
        maxlength:100,
        trim:true
    },
    account_number:{
        type:String,
        default:'No Address Specified',
        maxlength:100,
        trim:true
    },
    ifsc:{
        type: String,
        trim: true
    },
    bank_name:{
        type: String,
        trim: true
    },
    branch:{
        type: String,
        enum:['sales','tech','hr','telecaller'],
        trim: true
    },
    desgination:{
        type:String,
        default:'No Address Specified',
        maxlength:100,
        trim:true
    },
    gender:{
        type: String,
        trim: true
    },
    DOB:{
        type: String,
    },
    father_name:{
        type: String,
        trim: true
    },
    Un_no:{
        type: String,
        trim: true
    },
    Esi_no:{
        type: String,
        trim: true
    },
    mother_name:{
        type: String,
        trim: true
    },
    alternate_number: {
        type: String,
        trim: true
    },
    DOJ: {
        type: String,
        trim: true
    },
    experience:{
        type: String,
        trim: true
    },
    company_name:{
        type: String,
        trim: true
    },
    total_experience:{
        type: String,
        trim: true
    },
    reason_of_leaving:{
        type: String,
        trim: true
    },
    nominee_name:{
        type: String,
        trim: true
    },
    nominee_relation:{
        type: String,
        trim: true
    },
    nominee_mobile:{
        type: String,
        trim: true
    },
    nominee_address:{
        type: String,
        trim: true
    },
    nominee_age:{
        type: String,
        trim: true
    }


},{
    timestamps:true
});

// const SALT_FACTOR = process.env.BCRYPT_PASSWORD_SALT_FACTOR || 10;
const SALT_FACTOR = 10


// userSchema.path('password').validate(
//     console.log('calling')
// )


userSchema.pre('save',function(done){
    const user = this;
    if(!user.isModified('password'))
        return done();

    bcrypt.genSalt(SALT_FACTOR,(err,salt)=>{
        if(err){
            console.log(err);
            return done(err);
        }
        bcrypt.hash(user.password,salt,(err,hashedPassword)=>
        {
            if(err)
                return done(err);
            user.password = hashedPassword;
            return done();
        });
    });
});


userSchema.pre('updateOne',function(done){
    const user = this.getUpdate();
    if(!user.password)
        return done();
    bcrypt.genSalt(SALT_FACTOR,(err,salt)=>
    {
        if(err)
            return done(err);
        bcrypt.hash(user.password,salt,(err,hashedPassword)=>
        {
            if(err) return done(err);
            user.password = hashedPassword;
            return done();
        });
    });
});

module.exports = new mongoose.model('User',userSchema,'users');