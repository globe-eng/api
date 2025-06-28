
//classes
const Email = require("../../../services/email/Email");
const User = require("../../user/controllers/User");



class Notifications extends Email{
    constructor(props = {}) {
        super(props)
        this.props = props;
    }


    static async welcome(data){
        try {
            data = {...data};
            const user = new User(data);
            const getUser = await user.getUser()

            if(!getUser) return false

            const _data = {
                user: getUser.full_name,
                email: getUser.email,
                code: data.code,
                subject: `Welcome ${getUser.full_name}`,
            }

            const email = new Email({})
            await email.sendWelcomeEmail(_data)

            return true
        } catch (e) {
            console.log("Notifications > welcome: ", e)
            return false
        }
    };

    static async resetPasswordCode(data){
        try {
            data = {...data};
            const user = new User(data);
            const getUser = await user.getUser();

            if(!getUser) return false

            const _data = {
                user: getUser.full_name,
                email: getUser.email,
                code: data.code,
                subject: `Reset Password Code`,
            }

            const email = new Email({})
            await email.sendResetPasswordEmail(_data)

            return true
        } catch (e) {
            console.log("Notifications > resetPasswordCode: ", e)
            return false
        }
    };

    static async emailVerificationCode(data){
        try {
            data = {...data};
            const user = new User(data);
            const getUser = await user.getUser();

            if(!getUser) return false

            const _data = {
                user: getUser.full_name,
                email: getUser.email,
                code: data.code,
                subject: `Email Verification Code`,
            }

            const email = new Email({})
            await email.sendEmailVerificationCodeEmail(_data)

            return true
        } catch (e) {
            console.log("Notifications > emailVerificationCode: ", e)
            return false
        }
    };

    static async contactUs(data){
        try {
            data = {...data};
            const user = new User(data);
            const getUser = await user.getUser();

            if(!getUser) return false

            const _data = {
                email: data.email,
                name: data.name,
                subject: 'Contact Us',
                message: data.message,
            }

            const email = new Email({})
            await email.sendContactUs(_data)

            return true
        } catch (e) {
            console.log("Notifications > contactUs: ", e)
            return false
        }
    };
    


    static async depositSubmitted(data){
        try {
            data = {...data};
            const user = new User({slug: data.user});
            const getUser = await user.getUser();

            if(!getUser) return false

            const _data = {
                user: getUser.full_name,
                name: getUser.full_name,
                email: getUser.email,

                date: new Date(data?.created_at).toDateString(),
                subject: 'Deposit Request Submitted',
                amount: `${data.amount} USD`,
                method: data.payment_method,
                id: data.slug,
            }

            const email = new Email({})
            await email.sendDepositSubmitted(_data)

            return true
        } catch (e) {
            console.log("Notifications > depositSubmitted: ", e)
            return false
        }
    };

    static async depositSuccessful(data){
        try {
            data = {...data};
            const user = new User({slug: data.user});
            const getUser = await user.getUser();

            if(!getUser) return false

            const _data = {
                user: getUser.full_name,
                name: getUser.full_name,
                email: getUser.email,
                date: new Date(data?.created_at).toDateString(),
                subject: 'Deposit Successful',
                amount: `${data.amount} USD`,
                balance: `${getUser.balance} USD`,
                method: data.payment_method,
                id: data.slug,
            }

            const email = new Email({})
            await email.sendDepositSuccessful(_data)
            await email.sendDepositSuccessfulAdmin({
                ..._data,
                subject: `Deposit Successful - ${data.slug}`,
                user_email: getUser.email,
                email: 'rexfloki001@gmail.com',
            })

            return true
        } catch (e) {
            console.log("Notifications > depositSuccessful: ", e)
            return false
        }
    };

    static async depositFailed(data){
        try {
            data = {...data};
            const user = new User({slug: data.user});
            const getUser = await user.getUser();

            if(!getUser) return false

            const _data = {
                user: getUser.full_name,
                name: getUser.full_name,
                email: getUser.email,

                date: new Date().toDateString(),
                subject: 'Deposit Failed',
                amount: `${data.amount} USD`,
                method: data.payment_method,
                id: data.slug,
                reason: data.reason,
            }

            const email = new Email({})
            await email.sendDepositFailed(_data)

            return true
        } catch (e) {
            console.log("Notifications > depositFailed: ", e)
            return false
        }
    };



    static async withdrawalRequestSubmitted(data){
        try {
            data = {...data};
            const user = new User({slug: data.user});
            const getUser = await user.getUser();

            if(!getUser) return false

            const _data = {
                user: getUser.full_name,
                name: getUser.full_name,
                email: getUser.email,

                date: new Date().toDateString(),
                subject: 'Withdrawal Request Submitted',
                amount: `${data.amount} USD`,
                final_amount: `${data.final_amount} USD`,
                fee: `${data.fee} USD`,
                method: data.payment_method,
                id: data.slug,
            }

            const email = new Email({})
            await email.sendWithdrawalRequestSubmitted(_data);
            await email.sendWithdrawalRequestSubmittedAdmin({
                ..._data,
                subject: `Withdrawal Request - ${data.slug}`,
                user_email: getUser.email,
                email: 'rexfloki001@gmail.com',
            });

            return true
        } catch (e) {
            console.log("Notifications > withdrawalRequestSubmitted: ", e)
            return false
        }
    };

    static async withdrawalRequestSuccessful(data){
        try {
            data = {...data};
            const user = new User({slug: data.user});
            const getUser = await user.getUser();

            if(!getUser) return false

            const _data = {
                user: getUser.full_name,
                name: getUser.full_name,
                email: getUser.email,

                date: new Date().toDateString(),
                subject: 'Withdrawal Request Successful',
                amount: `${data.amount} USD`,
                final_amount: `${data.final_amount} USD`,
                fee: `${data.fee} USD`,
                method: data.payment_method,
                id: data.slug,
            }

            const email = new Email({})
            await email.sendWithdrawalRequestSuccessful(_data)

            return true
        } catch (e) {
            console.log("Notifications > withdrawalRequestSuccessful: ", e)
            return false
        }
    };

    static async withdrawalRequestFailed(data){
        try {
            data = {...data};
            const user = new User({slug: data.user});
            const getUser = await user.getUser();

            if(!getUser) return false

            const _data = {
                user: getUser.full_name,
                name: getUser.full_name,
                email: getUser.email,

                date: new Date().toDateString(),
                subject: 'Withdrawal Request Failed',
                amount: `${data.amount} USD`,
                final_amount: `${data.final_amount} USD`,
                fee: `${data.fee} USD`,
                method: data.payment_method,
                id: data.slug,
                reason: data.reason,
            }

            const email = new Email({})
            await email.sendWithdrawalRequestFailed(_data)

            return true
        } catch (e) {
            console.log("Notifications > withdrawalRequestFailed: ", e)
            return false
        }
    };



    static async investmentSuccessful(data){
        try {
            data = {...data};
            const user = new User({slug: data.user});
            const getUser = await user.getUser();

            if(!getUser) return false

            const _data = {
                user: getUser.full_name,
                name: getUser.full_name,
                email: getUser.email,
                date: new Date().toDateString(),

                subject: 'Investment Activation Successful',
                plan: `${data.type} Plan`,
                amount: `${data.amount} USD`,
                balance: `${getUser.balance} USD`,
                interest_percentage: `${data.percent*100}%`,
                id: data.slug,
            }

            const email = new Email({})
            await email.sendInvestmentSuccessful(_data)

            return true
        } catch (e) {
            console.log("Notifications > investmentSuccessful: ", e)
            return false
        }
    };

    static async investmentUpgrade(data){
        try {
            data = {...data};
            const user = new User({slug: data.user});
            const getUser = await user.getUser();

            if(!getUser) return false

            const _data = {
                user: getUser.full_name,
                name: getUser.full_name,
                email: getUser.email,
                date: new Date().toDateString(),

                subject: 'Great News! Your Investment Capital Has Been Upgraded',
                plan: `${data.type} Plan`,
                amount: `${data.amount} USD`,
                balance: `${getUser.balance} USD`,
                interest_percentage: `${data.percent*100}%`,
                id: data.slug,
            }

            const email = new Email({})
            await email.sendInvestmentUpgrade(_data)

            return true
        } catch (e) {
            console.log("Notifications > investmentUpgrade: ", e)
            return false
        }
    };

    static async investmentTopup(data){
        try {
            data = {...data};
            const user = new User({slug: data.user});
            const getUser = await user.getUser();

            if(!getUser) return false

            const _data = {
                user: getUser.full_name,
                name: getUser.full_name,
                email: getUser.email,
                date: new Date().toDateString(),

                subject: 'Top Up Successful',
                plan: `${data.type} Plan`,
                amount: `${data.amount} USD`,
                balance: `${getUser.balance} USD`,
                interest_percentage: `${data.percent*100}%`,
                id: data.slug,
            }

            const email = new Email({})
            await email.sendInvestmentTopup(_data)

            return true
        } catch (e) {
            console.log("Notifications > investmentUpgrade: ", e)
            return false
        }
    };

    static async investmentEarningsReceived(data){
        try {
            data = {...data};
            const user = new User({slug: data.user});
            const getUser = await user.getUser();

            if(!getUser) return false

            const _data = {
                user: getUser.full_name,
                name: getUser.full_name,
                email: getUser.email,
                date: new Date().toDateString(),

                subject: 'Earnings Received',
                plan: `${data.type} Plan`,
                amount: `${data.amount} USD`,
                balance: `${getUser.balance} USD`,
                interest_percentage: `${data.percent*100}%`,
                id: data.slug,
            }

            const email = new Email({})
            await email.sendInvestmentEarningsReceived(_data)

            return true
        } catch (e) {
            console.log("Notifications > investmentEarningsReceived: ", e)
            return false
        }
    };

    static async investmentClosingRequest(data){
        try {
            data = {...data};
            const user = new User({slug: data.user});
            const getUser = await user.getUser();

            if(!getUser) return false

            const _data = {
                user: getUser.full_name,
                name: getUser.full_name,
                email: getUser.email,
                date: new Date().toDateString(),

                subject: 'Investment Closing Request',
                plan: `${data.type} Plan`,
                amount: `${data.amount} USD`,
                balance: `${getUser.balance} USD`,
                interest_percentage: `${data.percent*100}%`,
                id: data.slug,
            }

            const email = new Email({})
            await email.sendInvestmentClosingRequest(_data)
            await email.sendInvestmentClosingRequestAdmin({
                ..._data,
                subject: `Investment Closing Request - ${data.slug}`,
                user_email: getUser.email,
                email: 'rexfloki001@gmail.com',
            })

            return true
        } catch (e) {
            console.log("Notifications > investmentClosingRequest: ", e)
            return false
        }
    };

    static async investmentClosingSuccessful(data){
        try {
            data = {...data};
            const user = new User({slug: data.user});
            const getUser = await user.getUser();

            if(!getUser) return false

            const _data = {
                user: getUser.full_name,
                name: getUser.full_name,
                email: getUser.email,
                date: new Date().toDateString(),

                subject: 'Investment Closing Request',
                plan: `${data.type} Plan`,
                amount: `${data.amount} USD`,
                balance: `${getUser.balance} USD`,
                interest_percentage: `${data.percent*100}%`,
                id: data.slug,
            }

            const email = new Email({})
            await email.sendInvestmentClosingSuccessful(_data)

            return true
        } catch (e) {
            console.log("Notifications > investmentClosingSuccessful: ", e)
            return false
        }
    };

    static async investmentMatured(data){
        try {
            data = {...data};
            const user = new User({slug: data.user});
            const getUser = await user.getUser();

            if(!getUser) return false

            const _data = {
                user: getUser.full_name,
                name: getUser.full_name,
                email: getUser.email,
                date: new Date().toDateString(),

                subject: 'Investment Maturity Completed',
                plan: `${data.type} Plan`,
                amount: `${data.amount} USD`,
                balance: `${getUser.balance} USD`,
                interest_percentage: `${data.percent*100}%`,
                id: data.slug,
            }

            const email = new Email({})
            await email.sendInvestmentMatured(_data)

            return true
        } catch (e) {
            console.log("Notifications > investmentMatured: ", e)
            return false
        }
    };



    static async affiliatePartnershipRequest(data){
        try {
            data = {...data};
            const user = new User({slug: data.user});
            const getUser = await user.getUser();

            if(!getUser) return false

            const _data = {
                user: getUser.full_name,
                name: getUser.full_name,
                email: getUser.email,
                date: new Date().toDateString(),

                subject: 'Your Request to Join Our Affiliate Program Has Been Received',
            }

            const email = new Email({})
            await email.sendAffiliatePartnershipRequest(_data)

            return true
        } catch (e) {
            console.log("Notifications > affiliatePartnershipRequest: ", e)
            return false
        }
    };

    static async affiliatePartnershipApproved(data){
        try {
            data = {...data};
            const user = new User({slug: data.user});
            const getUser = await user.getUser();

            if(!getUser) return false

            const _data = {
                user: getUser.full_name,
                name: getUser.full_name,
                email: getUser.email,
                date: new Date().toDateString(),

                subject: 'Your Request to Join Our Affiliate Program Has Been Received',
            }

            const email = new Email({})
            await email.sendAffiliatePartnershipApproved(_data)

            return true
        } catch (e) {
            console.log("Notifications > affiliatePartnershipApproved: ", e)
            return false
        }
    };

    static async affiliateReferralCommission(data){
        try {
            data = {...data};
            const user = new User({slug: data.user});
            const getUser = await user.getUser();

            if(!getUser) return false

            const _data = {
                user: getUser.full_name,
                name: getUser.full_name,
                email: getUser.email,
                date: new Date().toDateString(),

                subject: 'Referral Commission',
                amount: `${data.amount} USD`,
                balance: `${getUser.balance} USD`,
                leader_status: data.leader,
                id: data.slug,
            }

            const email = new Email({})
            await email.sendReferralCommission(_data)

            return true
        } catch (e) {
            console.log("Notifications > referralCommission: ", e)
            return false
        }
    };

    static async affiliateNewAffiliatePartner(data){
        try {
            data = {...data};
            const user = new User({_id: data.user});
            const getUser = await user.getUser();

            if(!getUser) return false

            const _data = {
                user: getUser.full_name,
                name: getUser.full_name,
                email: getUser.email,
                date: new Date().toDateString(),

                subject: 'New Partner Added',
                downline_name: data.downline_name,
            }

            const email = new Email({})
            await email.sendNewAffiliatePartner(_data)

            return true
        } catch (e) {
            console.log("Notifications > newAffiliatePartner: ", e)
            return false
        }
    };

    static async newAffiliateLeaderRank(data){
        try {
            data = {...data};
            const user = new User({_id: data.user});
            const getUser = await user.getUser();

            if(!getUser) return false

            const _data = {
                user: getUser.full_name,
                name: getUser.full_name,
                email: getUser.email,
                date: new Date().toDateString(),

                subject: 'New Leader Rank',
                amount: `${data.bonus} USD`,
                leader: data.leader
            }

            const email = new Email({})
            await email.sendNewAffiliateLeaderRank(_data)

            return true
        } catch (e) {
            console.log("Notifications > newAffiliateLeaderRank: ", e)
            return false
        }
    };

    static async affiliateNewLevelMilestone(data){
        try {
            data = {...data};
            const user = new User({_id: data.user});
            const getUser = await user.getUser();

            if(!getUser) return false

            const _data = {
                user: getUser.full_name,
                name: getUser.full_name,
                email: getUser.email,
                date: new Date().toDateString(),

                subject: `You’ve Reached a New Milestone – $${data.amount} Bonus Awarded!` ,
                amount: `$${data.amount}`,
                level: data.level,
            }

            const email = new Email({})
            await email.sendAffiliateNewLevelMilestone(_data)

            return true
        } catch (e) {
            console.log("Notifications > affiliateNewLevelMilestone: ", e)
            return false
        }
    };

}


module.exports = Notifications