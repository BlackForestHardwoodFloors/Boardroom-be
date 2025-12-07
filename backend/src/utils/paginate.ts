export const paginate = async (
    model: any,
    page: number = 1,
    pageSize: number = 10,
    options: any = {}
) => {
    const offset = (page - 1) * pageSize;

    // Separate count query to ensure correct counting
    const totalCount = await model.count({
        ...options,
        distinct: true, // Prevent duplicate counts
        col: 'id', // Ensure count is based on the primary key
        subQuery: false, // Allow direct count without pagination affecting it
    });

    // Fetch paginated data
    const result = await model.findAll({
        ...options,
        limit: pageSize,
        offset,
    });

    return {
        data: result,
        pagination: {
            totalCount,
            totalPages: Math.ceil(totalCount / pageSize),
            currentPage: page,
            pageSize,
        },
    };
};
