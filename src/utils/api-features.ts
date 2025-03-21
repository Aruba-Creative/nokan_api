import { Query, Document } from 'mongoose';

interface QueryString {
  [key: string]: string | undefined;
}

class APIFeatures<T extends Document> {
  constructor(
    public query: Query<T[], T>,
    private queryString: QueryString
  ) {}

  filter(): APIFeatures<T> {
    const reqObj: { [key: string]: any } = { ...this.queryString };
    const excludedFields = ['page', 'sort', 'limit', 'fields', 'search'];
    excludedFields.forEach((el) => delete reqObj[el]);

    // Handle the search query
    if (this.queryString.search) {
      const search = this.queryString.search;
      const searchConditions: { [key: string]: any }[] = [];

      // Define the fields you want to search in
      const searchableFields = [
        'name',
        'code',
        'address',
        'username',
        'role',
        'phoneNumber',
      ];

      // Use $regex and $options for case-insensitive partial matching
      searchConditions.push({
        $or: searchableFields.map((field) => ({
          [field]: { $regex: new RegExp(search, 'i') },
        })),
      });

      // Use $or to combine all search conditions with the existing conditions
      if (searchConditions.length > 0) {
        reqObj.$and = searchConditions;
      }
    }

    // Apply the filter conditions to the query
    this.query = this.query.find(reqObj);

    return this;
  }

  sort(): APIFeatures<T> {
    if (this.queryString.sort) {
      const sortBy = this.queryString.sort.split(',').join(' ');
      this.query = this.query.sort(sortBy);
    } else {
      this.query = this.query.sort('-createdAt');
    }

    return this;
  }

  limitFields(): APIFeatures<T> {
    if (this.queryString.fields) {
      const fields = this.queryString.fields.split(',').join(' ');
      this.query = this.query.select(fields);
    } else {
      this.query = this.query.select('-__v'); // hide fields
    }

    return this;
  }

  paginate(): APIFeatures<T> {
    const page = this.queryString.page
      ? parseInt(this.queryString.page, 10)
      : 1;
    const limit = this.queryString.limit
      ? parseInt(this.queryString.limit, 10)
      : 100;
    const skip = (page - 1) * limit;
    
    this.query = this.query.skip(skip).limit(limit);

    return this;
  }
}

export default APIFeatures;