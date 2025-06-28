

exports.PaginatePlugin = (schema, options) => {
    options = options || {}
    schema.query.paginate = async function(params) {

        const pagination = {
            limit: options.limit || 10,
            page: 1,
            count: 0,
            totalPages: 0,
            hasPrevPage: false,
            hasNextPage: false,
            prevPage: null,
            nextPage: null,
        }

        pagination.limit = parseInt(params.limit) || pagination.limit
        const page = parseInt(params.page)
        pagination.page = page > 0 ? page : pagination.page;
        const offset = (pagination.page - 1) * pagination.limit;

        const [data, count] = await Promise.all([
            this.limit(pagination.limit).skip(offset),
            this.model.countDocuments(this.getQuery())
        ]);

        const totalPages = Math.round(count/pagination.limit)
        const hasNextPage = (page !== totalPages) && !(page > totalPages)
        const hasPrevPage = page > 1

        pagination.count = count;
        pagination.hasPrevPage = hasPrevPage;
        pagination.prevPage = hasPrevPage? page - 1 : null;
        pagination.hasNextPage = hasNextPage;
        pagination.nextPage = hasNextPage? page + 1 : null;
        pagination.totalPages = totalPages;

        return { data, ...pagination }
    }
}