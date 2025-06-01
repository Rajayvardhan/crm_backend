const TeamDto = require('./team-dto');

class UserDto {
    id;
    name;
    email;
    username;
    mobile;
    image;
    type;
    address;
    status;
    team;
    account_number;
    ifsc;
    bank_name;
    desgination;

   
    current_address;
    permanent_address;
    branch;
    gender;
    DOB;
    father_name;
    mother_name;
    alternate_number;
    DOJ;
    experience;
    company_name;
    total_experience;
    reason_of_leaving;
    nominee_name;
    nominee_relation;
    nominee_mobile;
    nominee_address;
    nominee_age;

    constructor(user) {
        this.id = user._id;
        this.name = user.name;
        this.username = user.username;
        this.email = user.email;
        this.mobile = user.mobile;
        this.image = user.image && `${process.env.BASE_URL}storage/images/profile/${user.image}`;
        this.type = user.type && user.type.charAt(0).toUpperCase() + user.type.slice(1);
        this.address = user.address;
        this.status = user.status && user.status.charAt(0).toUpperCase() + user.status.slice(1);
        this.team = user.team && new TeamDto(Array.isArray(user.team) && user.team.length > 0 ? user.team[0] : user.team);

        this.account_number = user.account_number;
        this.ifsc = user.ifsc;
        this.bank_name = user.bank_name;
        this.desgination = user.desgination;

       
        this.current_address = user.current_address;
        this.permanent_address = user.permanent_address;
        this.branch = user.branch;
        this.gender = user.gender;
        this.DOB = user.DOB;
        this.father_name = user.father_name;
        this.mother_name = user.mother_name;
        this.alternate_number = user.alternate_number;
        this.DOJ = user.DOJ;
        this.experience = user.experience;
        this.company_name = user.company_name;
        this.total_experience = user.total_experience;
        this.reason_of_leaving = user.reason_of_leaving;
        this.nominee_name = user.nominee_name;
        this.nominee_relation = user.nominee_relation;
        this.nominee_mobile = user.nominee_mobile;
        this.nominee_address = user.nominee_address;
        this.nominee_age = user.nominee_age;
    }
}

module.exports = UserDto;
