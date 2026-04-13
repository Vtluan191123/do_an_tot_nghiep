// User Search Request - TypeScript Type Definition
// File: datn_fe/src/app/model/user-filter-request.ts

/**
 * Corresponds to backend: com.dntn.datn_be.dto.request.UserFilterRequest
 * Extends: BaseFilterRequest
 */
export interface UserFilterRequest {
  // ========== Pagination (from BaseFilterRequest) ==========
  /** 0-indexed page number. Default: 0 */
  page?: number;

  /** Records per page. Default: 10 (Range: 1-100) */
  size?: number;

  // ========== Sorting (from BaseFilterRequest) ==========
  /** Field to sort by. Default: "id" */
  sortBy?: string;

  /** Sort direction: "asc" or "desc". Default: "desc" */
  sortDirection?: 'asc' | 'desc';

  // ========== Search (from BaseFilterRequest) ==========
  /** Keyword to search in username, email, description. Optional */
  keyword?: string;

  // ========== Filters (UserFilterRequest specific) ==========
  /** Filter by specific user ID. Optional */
  id?: number;

  /** Filter by role ID. Optional */
  roleId?: number;

  /** Filter users created from this date. Format: "yyyy-MM-dd". Optional */
  fromDate?: string;

  /** Filter users created to this date. Format: "yyyy-MM-dd". Optional */
  toDate?: string;
}

/**
 * Factory functions to create common request objects
 */
export class UserFilterRequestBuilder {
  /**
   * Create request for keyword search
   * @param keyword Search term
   * @param page Page number (0-indexed)
   * @param size Results per page
   */
  static search(keyword: string, page = 0, size = 10): UserFilterRequest {
    return {
      keyword,
      page,
      size,
      sortBy: 'id',
      sortDirection: 'desc',
    };
  }

  /**
   * Create request to get all users
   * @param page Page number (0-indexed)
   * @param size Results per page
   */
  static getAll(page = 0, size = 10): UserFilterRequest {
    return {
      page,
      size,
      sortBy: 'id',
      sortDirection: 'desc',
    };
  }

  /**
   * Create request to get specific user by ID
   * @param id User ID
   */
  static getById(id: number): UserFilterRequest {
    return {
      id,
      page: 0,
      size: 1,
      sortBy: 'id',
      sortDirection: 'desc',
    };
  }

  /**
   * Create request to filter by role
   * @param roleId Role ID
   * @param page Page number (0-indexed)
   * @param size Results per page
   */
  static filterByRole(roleId: number, page = 0, size = 10): UserFilterRequest {
    return {
      roleId,
      page,
      size,
      sortBy: 'id',
      sortDirection: 'desc',
    };
  }

  /**
   * Create request to filter by date range
   * @param fromDate Start date (yyyy-MM-dd)
   * @param toDate End date (yyyy-MM-dd)
   * @param page Page number (0-indexed)
   * @param size Results per page
   */
  static filterByDateRange(
    fromDate: string,
    toDate: string,
    page = 0,
    size = 10
  ): UserFilterRequest {
    return {
      fromDate,
      toDate,
      page,
      size,
      sortBy: 'id',
      sortDirection: 'desc',
    };
  }

  /**
   * Create custom request
   * @param config Custom configuration
   */
  static custom(config: Partial<UserFilterRequest>): UserFilterRequest {
    return {
      page: 0,
      size: 10,
      sortBy: 'id',
      sortDirection: 'desc',
      ...config, // Override defaults with custom config
    };
  }
}

/**
 * Response from /api/user/search endpoint
 */
export interface UserSearchResponse {
  status: number;
  data: UserResponse[];
  count: number;
  message?: string;
}

/**
 * User data in response
 */
export interface UserResponse {
  id: number;
  username: string;
  email: string;
  description?: string;
  address?: string;
  imagesUrl?: string;
  age?: string;
  phoneNumber?: string;
  voteStar?: number;
  friend: boolean;
  createdAt?: string;
  roleId?: number;
}


/**
 * Usage Examples:
 *
 * ✅ CORRECT USAGE:
 *
 * // Search with keyword
 * const request1 = UserFilterRequestBuilder.search('exam');
 * const request1_alt = {
 *   keyword: 'exam',
 *   page: 0,
 *   size: 10,
 *   sortBy: 'id',
 *   sortDirection: 'desc'
 * };
 *
 * // Get all users
 * const request2 = UserFilterRequestBuilder.getAll();
 *
 * // Get specific user
 * const request3 = UserFilterRequestBuilder.getById(5);
 *
 * // Filter by role
 * const request4 = UserFilterRequestBuilder.filterByRole(3);
 *
 * // Date range filter
 * const request5 = UserFilterRequestBuilder.filterByDateRange(
 *   '2024-01-01',
 *   '2024-12-31'
 * );
 *
 * // Custom combination
 * const request6 = UserFilterRequestBuilder.custom({
 *   keyword: 'exam',
 *   sortBy: 'username',
 *   sortDirection: 'asc'
 * });
 *
 *
 * ❌ WRONG USAGE (DO NOT DO THIS):
 *
 * // Bad: redundant 'search' field
 * const wrong1 = {
 *   search: 'exam',
 *   keyword: 'exam'  // Duplicate!
 * };
 *
 * // Bad: null values
 * const wrong2 = {
 *   id: null,
 *   roleId: null,
 *   fromDate: null
 * };
 *
 * // Bad: string types for number fields
 * const wrong3 = {
 *   id: '1',  // Should be number
 *   page: '0'  // Should be number
 * };
 */

