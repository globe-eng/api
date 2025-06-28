
const User = require("./User");

const UserModel = require('../../user/models/userModel');
const CommissionModel = require('../../affiliate/models/commissionModel');
const LeaderHistoryModel = require('../../affiliate/models/leaderHistoryModel');
const TeamDepositHistoryModel = require('../../affiliate/models/teamDepositHistoryModel');
const TransactionModel = require('../../transaction/models/transactionModel');

// Get getUser
exports.getUser = async (req, res) => {
    try {
        const slug = req.params.slug;
        const query = req.query;
        let authUser = req.authUser;

        const user = new User(authUser);
        const getUser = await user.getUser()

        if(getUser){
            return res.json({
                success: true,
                ...getUser,
                response: 'User Found',
                message: 'User data retrieved successfully.'
            });
        } else {
            return res.json({
                success: false,
                response: 'User Not Found',
                message: 'No user found with the provided information.'
            });
        }
    } catch (e) {
        console.log(e)
        return res.json({
            success: false,
            response: 'Failed',
            message: 'There was an error, please ty again'
        });
    }
}

// Get getUsers
exports.getUsers = async (req, res) => {
    try {
        const query = req.query;
        let authUser = req.authUser;

        const user = new User(query);
        const getUsers = await user.getUsers()
        return res.json(getUsers);
    } catch (e) {
        return res.json([]);
    }
}

exports.updateUser = async (req, res) => {
    try {
        const slug = req.params.slug;
        const query = req.query;
        let body = req.body;
        let authUser = req.authUser;

         body.slug = authUser.slug;
         body.email = authUser.email;
         body._id = authUser.id;
         body.username = authUser.username;

        const user = new User();
        const result = await user.updateUser(body)
        const userData = await user.getUser(body);

        return res.json({
            ...result,
           data: userData
        });

    } catch (e) {
        console.log(e)
        return res.json({
            success: false,
            response: 'Failed',
            message: 'There was an error, please ty again'
        });
    }
}


exports.test = async (req, res) => {
    try {
        const slug = req.params.slug;
        const query = req.query;
        let body = req.body;
        let authUser = req.authUser;

        const user = new User();

        /*const result = await user.userData({
            //"email": "rexfloki001@gmail.com",
            //"username": "rex",
            "slug": "pdph6",
            //"_id": "6841743ee3b3c96acdb60728",
        })*/

        await UserModel.updateMany({
            "balance": 0,
            "leader": 0,
            "leader_bonus": 0,
            "affiliate_balance": 0,
            "affiliate_bonus": 0,
            "affiliate_commissions": 0,
            "personal_investment": 0,
            "personal_deposit": 0,
            "personal_withdrawal": 0,
            "personal_earnings": 0,
            "team_investment": 0,
            "team_deposit": 0,
            "team_deposit_leader1": 0,
            "team_deposit_leader2": 0,
            "team_deposit_leader3": 0,
            "team_deposit_level_milestone": 0,
            "team_deposit_level_total": 0,
        });

        await CommissionModel.deleteMany()
        await LeaderHistoryModel.deleteMany()
        await TeamDepositHistoryModel.deleteMany()
        await TransactionModel.deleteMany()


        return res.json({
            success: true,
            response: 'Success',
            message: 'User data retrieved successfully.',
            //data: result
        });

    } catch (e) {
        console.log(e)
        return res.json({
            success: false,
            response: 'Failed',
            message: 'There was an error, please ty again'
        });
    }
}