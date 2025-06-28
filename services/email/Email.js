const nodemailer = require("nodemailer");
const fs = require("fs");
const path = require("path");
const ejs = require("ejs");


class Email {

    constructor(props = {}) {
        this.props = props;
        this.defaultSmtpTransport = {
            host: 'smtp.protonmail.ch',
            user: 'noreply@poseidondigitalassets.com',
            pass: '52UNFZTUR1J88RCV',
            from: '"Poseidon Digital Assets" <noreply@poseidondigitalassets.com>',
        }
    }

    async smtpTransport(data = this.defaultSmtpTransport) {
        data = {...data};
        return nodemailer.createTransport({
            //service: 'gmail',
            host: data.host,
            port: 465, //25 | 465 | 587
            auth: {
                user: data.user,
                pass: data.pass
            },
            tls: {rejectUnauthorized: false},
            debug: false,
            connectionTimeout: 15000,
            greetingTimeout: 10000,
            socketTimeout: 10000
        });
    }

    async email(data, smtp = this.defaultSmtpTransport) {
       try {
           data = {...data};
           smtp = {...smtp};
           const transport = await this.smtpTransport(smtp);
           return await transport.sendMail({
               from: smtp.from,
               to: data.email,
               subject: data.subject,
               html: data.content
           })
       } catch (e) {
           console.log("Email > email: ", e.message)
           return {
                success: false,
                message: e.message,
           }
       }
    }

    async sendWelcomeEmail(data) {
        try {
            data = {...data};
            /*const welcome = {
            type: 'welcome',
            user: 'John Doe',
            email: 'rexfloki001@gmail.com',
            code: 455467,
            subject: 'Welcome John Doe',
            }*/
            const template = fs.readFileSync(path.join(__dirname, '/templates/welcome.html'), 'utf-8');
            const content = ejs.render(template, data);

            if(data.test){
                return content
            }

            const result = await this.email({
                content: content,
                email: data.email,
                subject: data.subject,
            });
            return (result?.accepted?.length > 0);
        } catch (e) {
            console.log("Email > sendWelcomeEmail: ", e)
            return false
        }
    }

    async sendResetPasswordEmail(data) {
        try {
            data = {...data};
            /*const welcome = {
            type: 'welcome',
            user: 'John Doe',
            email: 'rexfloki001@gmail.com',
            code: 455467,
            subject: 'Welcome John Doe',
        }*/
            const template = fs.readFileSync(path.join(__dirname, '/templates/reset_password_code.html'), 'utf-8');
            const content = ejs.render(template, data);

            if(data.test){
                return content
            }

            const result = await this.email({
                content: content,
                email: data.email,
                subject: data.subject,
            });
            return (result?.accepted?.length > 0);
        } catch (e) {
            console.log("Email > sendResetPasswordEmail: ", e)
            return false
        }
    }

    async sendEmailVerificationCodeEmail(data) {
        try {
            data = {...data};
            /*const welcome = {
            type: 'welcome',
            user: 'John Doe',
            email: 'rexfloki001@gmail.com',
            code: 455467,
            subject: 'Welcome John Doe',
           }*/
            const template = fs.readFileSync(path.join(__dirname, '/templates/email_verification_code.html'), 'utf-8');
            const content = ejs.render(template, data);

            if(data.test){
                return content
            }

            const result = await this.email({
                content: content,
                email: data.email,
                subject: data.subject,
            });
            return (result?.accepted?.length > 0);
        } catch (e) {
            console.log("Email > sendEmailVerificationCodeEmail: ", e)
            return false
        }
    }


    async sendDepositSubmitted(data) {
        try {
            data = {...data};
            /*
              name: 'Rex',
              email: 'rexfloki001@gmail.com',
              date: new Date().toDateString(),
              subject: 'Deposit Request Submitted',
              amount: '1000 USD',
              method: 'BTC',
               id: 'g565vh',
            * */
            const template = fs.readFileSync(path.join(__dirname, '/templates/deposit_submitted.html'), 'utf-8');
            const content = ejs.render(template, data);

            if(data.test){
                return content
            }

            const result = await this.email({
                content: content,
                email: data.email,
                subject: data.subject,
            });

            //console.log(result)

            return (result?.accepted?.length > 0);
        } catch (e) {
            console.log("Email > sendDepositSubmitted: ", e)
            return false
        }
    }

    async sendDepositSuccessful(data) {
        try {
            data = {...data};
            /*
              name: 'Rex',
            email: 'rexfloki001@gmail.com',
            date: new Date().toDateString(),
            subject: 'Deposit Successful ',
            amount: '1000 USD',
            method: 'BTC',
            id: 'g565vh',
            balance: '1500 USD',
            * */
            const template = fs.readFileSync(path.join(__dirname, '/templates/deposit_successful.html'), 'utf-8');
            const content = ejs.render(template, data);

            if(data.test){
                return content
            }

            const result = await this.email({
                content: content,
                email: data.email,
                subject: data.subject,
            });
            return (result?.accepted?.length > 0);
        } catch (e) {
            console.log("Email > sendDepositSuccessful: ", e)
            return false
        }
    }

    async sendDepositSuccessfulAdmin(data) {
        try {
            data = {...data};
            /*
              name: 'Rex',
            email: 'rexfloki001@gmail.com',
            date: new Date().toDateString(),
            subject: 'Deposit Successful ',
            amount: '1000 USD',
            method: 'BTC',
            id: 'g565vh',
            balance: '1500 USD',
            * */
            const template = fs.readFileSync(path.join(__dirname, '/templates/deposit_successful_admin.html'), 'utf-8');
            const content = ejs.render(template, data);

            if(data.test){
                return content
            }

            const result = await this.email({
                content: content,
                email: data.email,
                subject: data.subject,
            });

            return (result?.accepted?.length > 0);
        } catch (e) {
            console.log("Email > sendDepositSuccessfulAdmin: ", e)
            return false
        }
    }

    async sendDepositFailed(data) {
        try {
            data = {...data};
            /*
             email: 'rexfloki001@gmail.com',
             subject: 'Deposit Request Failed',
             amount: '1000 USD',
             method: 'BTC',
             id: 'g565vh',
              reason: 'here is the reason',
            * */
            const template = fs.readFileSync(path.join(__dirname, '/templates/deposit_failed.html'), 'utf-8');
            const content = ejs.render(template, data);

            if(data.test){
                return content
            }

            const result = await this.email({
                content: content,
                email: data.email,
                subject: data.subject,
            });
            return (result?.accepted?.length > 0);
        } catch (e) {
            console.log("Email > sendDepositFailed: ", e)
            return false
        }
    }


    async sendWithdrawalRequestSubmitted(data) {
        try {
            data = {...data};
            /*
              type: 'withdrawal_submitted',
            name: 'Rex',
            email: 'rexfloki001@gmail.com',
            date: new Date().toDateString(),
            subject: 'Withdrawal Request Submitted',
            amount: '1000 USD',
            final_amount: '1000 USD',
            method: 'BTC',
            fee: '1000 USD',
            id: 'g565vh',
            * */
            const template = fs.readFileSync(path.join(__dirname, '/templates/withdrawal_submitted.html'), 'utf-8');
            const content = ejs.render(template, data);

            if(data.test){
                return content
            }

            const result = await this.email({
                content: content,
                email: data.email,
                subject: data.subject,
            });
            return (result?.accepted?.length > 0);
        } catch (e) {
            console.log("Email > sendWithdrawalRequestSubmitted: ", e)
            return false
        }
    }

    async sendWithdrawalRequestSubmittedAdmin(data) {
        try {
            data = {...data};
            /*
                type: 'withdrawal_submitted_admin',
                email: 'rexfloki001@gmail.com',
                subject: 'Unstaking Request - 1234',
                user: 'Rex Floki',
                user_email: 'rexfloki001@gmail.com',
                amount: '1000 USD',
                final_amount: '900 USD',
                fee: '30 USD',
                method: 'BTC',
                id: 'g565vh',
            * */
            const template = fs.readFileSync(path.join(__dirname, '/templates/withdrawal_submitted_admin.html'), 'utf-8');
            const content = ejs.render(template, data);

            if(data.test){
                return content
            }

            const result = await this.email({
                content: content,
                email: data.email,
                subject: data.subject,
            });
            return (result?.accepted?.length > 0);
        } catch (e) {
            console.log("Email > sendWithdrawalRequestSubmittedAdmin: ", e)
            return false
        }
    }

    async sendWithdrawalRequestSuccessful(data) {
        try {
            data = {...data};
            /*
                 type: 'withdrawal_successful',
            name: 'Rex',
            email: 'rexfloki001@gmail.com',
            date: new Date().toDateString(),
            subject: 'Withdrawal Request Successful',
            amount: '1000 USD',
            method: 'BTC',
            fee: '1000 USD',
            id: 'g565vh',
            * */
            const template = fs.readFileSync(path.join(__dirname, '/templates/withdrawal_successful.html'), 'utf-8');
            const content = ejs.render(template, data);

            if(data.test){
                return content
            }

            const result = await this.email({
                content: content,
                email: data.email,
                subject: data.subject,
            });
            return (result?.accepted?.length > 0);
        } catch (e) {
            console.log("Email > sendWithdrawalRequestSuccessful: ", e)
            return false
        }
    }

    async sendWithdrawalRequestFailed(data) {
        try {
            data = {...data};
            /*
                 type: 'withdrawal_failed',
            email: 'rexfloki001@gmail.com',
            subject: 'Withdrawal Request Failed',
            amount: '1000 USD',
            balance: '1000 USD',
            method: 'BTC',
            fee: '1000 USD',
            id: 'g565vh',
            reason: 'Here is reasn',
            * */
            const template = fs.readFileSync(path.join(__dirname, '/templates/withdrawal_failed.html'), 'utf-8');
            const content = ejs.render(template, data);

            if(data.test){
                return content
            }

            const result = await this.email({
                content: content,
                email: data.email,
                subject: data.subject,
            });
            return (result?.accepted?.length > 0);
        } catch (e) {
            console.log("Email > sendWithdrawalRequestFailed: ", e)
            return false
        }
    }


    async sendInvestmentSuccessful(data) {
        try {
            data = {...data};
            /*
               type: 'investment_successful',
            name: 'Rex',
            email: 'rexfloki001@gmail.com',
            date: new Date().toDateString(),
            subject: 'Activation Successful',
            otp: 'SSSSS',
            amount: '1000 USD',
            balance: '1000 USD',
            interest_percentage: '1.5%',
            id: 'g565vh',
            * */
            const template = fs.readFileSync(path.join(__dirname, '/templates/investment_successful.html'), 'utf-8');
            const content = ejs.render(template, data);

            if(data.test){
                return content
            }

            const result = await this.email({
                content: content,
                email: data.email,
                subject: data.subject,
            });
            return (result?.accepted?.length > 0);
        } catch (e) {
            console.log("Email > sendInvestmentSuccessful: ", e)
            return false
        }
    }

    async sendInvestmentUpgrade(data) {
        try {
            data = {...data};
            /*
              type: 'investment_upgrade',
            name: 'Rex',
            email: 'rexfloki001@gmail.com',
            subject: 'Great News! Your Staked Capital Has Been Upgraded',
            otp: 'SSSSS',
            * */
            const template = fs.readFileSync(path.join(__dirname, '/templates/investment_upgrade.html'), 'utf-8');
            const content = ejs.render(template, data);

            if(data.test){
                return content
            }

            const result = await this.email({
                content: content,
                email: data.email,
                subject: data.subject,
            });
            return (result?.accepted?.length > 0);
        } catch (e) {
            console.log("Email > sendInvestmentUpgrade: ", e)
            return false
        }
    }

    async sendInvestmentTopup(data) {
        try {
            data = {...data};
            /*
               type: 'investment_top_up',
            name: 'Rex',
            email: 'rexfloki001@gmail.com',
            date: new Date().toDateString(),
            subject: 'Top Up Successful',
            amount: '1000 USD',
            balance: '1000 USD',
            otp: 'OTP Name',
            interest_percentage: '1.5%',
            id: 'g565vh',
            * */
            const template = fs.readFileSync(path.join(__dirname, '/templates/investment_top_up.html'), 'utf-8');
            const content = ejs.render(template, data);

            if(data.test){
                return content
            }

            const result = await this.email({
                content: content,
                email: data.email,
                subject: data.subject,
            });
            return (result?.accepted?.length > 0);
        } catch (e) {
            console.log("Email > sendInvestmentTopup: ", e)
            return false
        }
    }

    async sendInvestmentEarningsReceived(data) {
        try {
            data = {...data};
            /*
               type: 'earnings_received',
            email: 'rexfloki001@gmail.com',
            name: 'Rex',
            subject: 'Earnings Received',
            amount: '1000 USD',
            balance: '1000 USD',
            otp: 'Name of OTP',
            id: 'g565vh',
            * */
            const template = fs.readFileSync(path.join(__dirname, '/templates/investment_earnings_received.html'), 'utf-8');
            const content = ejs.render(template, data);

            if(data.test){
                return content
            }

            const result = await this.email({
                content: content,
                email: data.email,
                subject: data.subject,
            });
            return (result?.accepted?.length > 0);
        } catch (e) {
            console.log("Email > sendInvestmentEarningsReceived: ", e)
            return false
        }
    }

    async sendInvestmentClosingRequest(data) {
        try {
            data = {...data};
            /*
              type: 'unstaking_request',
            name: 'Rex',
            email: 'rexfloki001@gmail.com',
            date: new Date().toDateString(),
            subject: 'Unstaking Request',
            amount: '1000 USD',
            otp: 'TRANQUIL OTP',
            id: 'g565vh',
            * */
            const template = fs.readFileSync(path.join(__dirname, '/templates/investment_closing_request.html'), 'utf-8');
            const content = ejs.render(template, data);

            if(data.test){
                return content
            }

            const result = await this.email({
                content: content,
                email: data.email,
                subject: data.subject,
            });
            return (result?.accepted?.length > 0);
        } catch (e) {
            console.log("Email > sendInvestmentClosingRequest: ", e)
            return false
        }
    }

    async sendInvestmentClosingRequestAdmin(data) {
        try {
            data = {...data};
            /*
                type: 'unstaking_request_admin',
            email: 'rexfloki001@gmail.com',
            subject: 'Unstaking Request - 1234',
            user: 'Rex Floki',
            user_email: 'rexfloki001@gmail.com',
            amount: '1000 USD',
            otp: 'TRANQUIL OTP',
            id: 'g565vh',
            * */
            const template = fs.readFileSync(path.join(__dirname, '/templates/investment_closing_request_admin.html'), 'utf-8');
            const content = ejs.render(template, data);

            if(data.test){
                return content
            }

            const result = await this.email({
                content: content,
                email: data.email,
                subject: data.subject,
            });
            return (result?.accepted?.length > 0);
        } catch (e) {
            console.log("Email > sendInvestmentClosingRequestAdmin: ", e)
            return false
        }
    }

    async sendInvestmentClosingSuccessful(data) {
        try {
            data = {...data};
            /*
                type: 'unstaking_successful',
            name: 'Rex',
            email: 'rexfloki001@gmail.com',
            date: new Date().toDateString(),
            subject: 'Unstaking Successful',
            amount: '1000 USD',
            otp: 'TRANQUIL OTP',
            id: 'g565vh',
            * */
            const template = fs.readFileSync(path.join(__dirname, '/templates/investment_closing_successful.html'), 'utf-8');
            const content = ejs.render(template, data);

            if(data.test){
                return content
            }

            const result = await this.email({
                content: content,
                email: data.email,
                subject: data.subject,
            });
            return (result?.accepted?.length > 0);
        } catch (e) {
            console.log("Email > sendInvestmentClosingSuccessful: ", e)
            return false
        }
    }

    async sendInvestmentMatured(data) {
        try {
            data = {...data};
            /*
                type: 'unstaking_successful',
            name: 'Rex',
            email: 'rexfloki001@gmail.com',
            date: new Date().toDateString(),
            subject: 'Investment Maturity Completed',
            amount: '1000 USD',
            otp: 'TRANQUIL OTP',
            id: 'g565vh',
            * */
            const template = fs.readFileSync(path.join(__dirname, '/templates/investment_matured.html'), 'utf-8');
            const content = ejs.render(template, data);

            if(data.test){
                return content
            }

            const result = await this.email({
                content: content,
                email: data.email,
                subject: data.subject,
            });
            return (result?.accepted?.length > 0);
        } catch (e) {
            console.log("Email > sendInvestmentClosingSuccessful: ", e)
            return false
        }
    }


    async sendAffiliatePartnershipApproved(data) {
        try {
            data = {...data};
            /*
               type: 'affiliate_partnership_approved',
            email: 'rexfloki001@gmail.com',
            name: 'Rex',
            subject: 'Your Request to Join Our Affiliate Program Has Been Received',
            first_name: 'Rex',
            amount: '$100',
            * */
            const template = fs.readFileSync(path.join(__dirname, '/templates/affiliate_partnership_approved.html'), 'utf-8');
            const content = ejs.render(template, data);

            if(data.test){
                return content
            }

            const result = await this.email({
                content: content,
                email: data.email,
                subject: data.subject,
            });
            return (result?.accepted?.length > 0);
        } catch (e) {
            console.log("Email > sendAffiliatePartnershipApproved: ", e)
            return false
        }
    }

    async sendAffiliatePartnershipRequest(data) {
        try {
            data = {...data};
            /*
                 type: 'affiliate_partnership_request',
            email: 'rexfloki001@gmail.com',
            name: 'Rex',
            subject: 'Your Request to Join Our Affiliate Program Has Been Received',
            first_name: 'Rex',
            amount: '$100',
            * */
            const template = fs.readFileSync(path.join(__dirname, '/templates/affiliate_partnership_request.html'), 'utf-8');
            const content = ejs.render(template, data);

            if(data.test){
                return content
            }

            const result = await this.email({
                content: content,
                email: data.email,
                subject: data.subject,
            });
            return (result?.accepted?.length > 0);
        } catch (e) {
            console.log("Email > sendAffiliatePartnershipRequest: ", e)
            return false
        }
    }

    async sendReferralCommission(data) {
        try {
            data = {...data};
            /*
                type: 'referral_commission',
            email: 'rexfloki001@gmail.com',
            name: 'Rex',
            subject: 'Referral Commission',
            amount: '1000 USD',
            balance: '1000 USD',
            leader_status: 1,
            id: 'g565vh',
            * */
            const template = fs.readFileSync(path.join(__dirname, '/templates/referral_commission.html'), 'utf-8');
            const content = ejs.render(template, data);

            if(data.test){
                return content
            }

            const result = await this.email({
                content: content,
                email: data.email,
                subject: data.subject,
            });
            return (result?.accepted?.length > 0);
        } catch (e) {
            console.log("Email > sendReferralCommission: ", e)
            return false
        }
    }

    async sendNewAffiliatePartner(data) {
        try {
            data = {...data};
            /*
                 type: 'new_affiliate_partner',
            email: 'rexfloki001@gmail.com',
            subject: 'New Partner Added',
            name: 'Rex',
            downline_name: 'John Doe',
            leader: 1
            * */
            const template = fs.readFileSync(path.join(__dirname, '/templates/new_affiliate_partner.html'), 'utf-8');
            const content = ejs.render(template, data);

            if(data.test){
                return content
            }

            const result = await this.email({
                content: content,
                email: data.email,
                subject: data.subject,
            });
            return (result?.accepted?.length > 0);
        } catch (e) {
            console.log("Email > sendNewAffiliatePartner: ", e)
            return false
        }
    }

    async sendNewAffiliateLeaderRank(data) {
        try {
            data = {...data};
            /*
                    type: 'new_leader_rank',
                    email: user.email,
                    subject: 'New Leader Rank',
                    amount: `${bonus} USD`,
                    leader: leader
            * */
            const template = fs.readFileSync(path.join(__dirname, '/templates/new_leader_rank.html'), 'utf-8');
            const content = ejs.render(template, data);

            if(data.test){
                return content
            }

            const result = await this.email({
                content: content,
                email: data.email,
                subject: data.subject,
            });
            return (result?.accepted?.length > 0);
        } catch (e) {
            console.log("Email > sendNewAffiliatePartner: ", e)
            return false
        }
    }

    async sendAffiliateNewLevelMilestone(data) {
        try {
            data = {...data};
            /*
                    type: 'new_leader_rank',
                    email: user.email,
                    subject: 'New Leader Rank',
                    amount: `${bonus} USD`,
                    leader: leader
            * */
            const template = fs.readFileSync(path.join(__dirname, '/templates/affiliate_new_level_milestone.html'), 'utf-8');
            const content = ejs.render(template, data);

            if(data.test){
                return content
            }

            const result = await this.email({
                content: content,
                email: data.email,
                subject: data.subject,
            });
            return (result?.accepted?.length > 0);
        } catch (e) {
            console.log("Email > sendNewAffiliatePartner: ", e)
            return false
        }
    }



    async sendContactUs(data) {
        try {
            data = {...data};
            /*
                type: 'contact_us',
                email: 'rexfloki001@gmail.com',
                name: 'Rex Floki',
                subject: 'Contact Us',
                message: 'Hello world',
            * */
            const template = fs.readFileSync(path.join(__dirname, '/templates/referral_commission.html'), 'utf-8');
            const content = ejs.render(template, data);

            if(data.test){
                return content
            }

            const result = await this.email({
                content: content,
                email: data.email,
                subject: data.subject,
            });
            return (result?.accepted?.length > 0);
        } catch (e) {
            console.log("Email > sendContactUs: ", e)
            return false
        }
    }
}

module.exports = Email