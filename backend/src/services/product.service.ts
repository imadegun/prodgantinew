import { getMySQLPool } from '../config/mysql';
import { AppError } from '../middleware/error.middleware';

interface GayafusionProduct {
  id: number;
  product_code: string;
  product_name: string;
  color: string;
  texture: string;
  material: string;
  size: string;
  final_size: string;
  clay_type: string;
  clay_quantity: number;
  glaze: string;
  engobe: string;
  luster: string;
  stains_oxides: string;
  casting_tools: string;
  extruders: string;
  textures: string;
  general_tools: string;
  build_notes: string;
}

interface ProductSearchResult {
  id: number;
  productCode: string;
  productName: string;
  categoryName: string;
  colorName: string;
  materialName: string;
  sizeName: string;
  textureName: string;
  designCode: string;
  clientCode: string;
  photo1?: string;
}

interface ProductDetail {
  productCode: string;
  productName: string;
  color: string;
  texture: string;
  material: string;
  size: string;
  finalSize: string;
  clayType: string;
  clayQuantity: number;
  glaze: string;
  engobe: string;
  luster: string;
  stainsOxides: string;
  castingTools: string;
  extruders: string;
  textures: string;
  generalTools: string;
  buildNotes: string;
}

interface MaterialRequirements {
  productCode: string;
  materials: {
    clay: { type: string; quantity: number }[];
    glazes: string[];
    engobes: string[];
    lusters: string[];
    stainsOxides: string[];
  };
}

interface ToolRequirements {
  productCode: string;
  tools: {
    castingTools: string[];
    extruders: string[];
    textures: string[];
    generalTools: string[];
  };
}

export class ProductService {
  /**
   * Get all clients from tblcollect_design
   */
  async getClients() {
    const pool = getMySQLPool();
    
    if (!pool) {
      throw new AppError('MySQL connection not initialized', 500, 'MYSQL_NOT_INITIALIZED');
    }
    
    try {
      const [rows] = await pool.execute(
        `SELECT DesignCode, DesignName FROM tblcollect_design ORDER BY DesignName ASC`
      );
      
      const clients: { designCode: string; designName: string }[] = (rows as any[]).map((row: any) => ({
        designCode: row.DesignCode,
        designName: row.DesignName,
      }));
      
      return {
        clients,
        total: clients.length,
      };
    } catch (error: any) {
      console.error('Error getting clients from gayafusionall:', error);
      throw new AppError('Failed to get clients', 500, 'CLIENTS_GET_ERROR');
    }
  }

  /**
   * Search products from gayafusionall tblcollect_master
   * Filters by DesignCode (client) and includes related data from reference tables
   */
  async searchProducts(query: string, limit: number = 50, designCode?: string) {
    const pool = getMySQLPool();
    
    if (!pool) {
      throw new AppError('MySQL connection not initialized', 500, 'MYSQL_NOT_INITIALIZED');
    }
    
    try {
      let sql = `
        SELECT 
          m.ID as id,
          m.CollectCode as productCode,
          m.ClientDescription as productName,
          COALESCE(n.NameDesc, c.CategoryName) as categoryName,
          COALESCE(cl.ColorName, '') as colorName,
          COALESCE(mt.MaterialName, '') as materialName,
          COALESCE(s.SizeName, '') as sizeName,
          COALESCE(t.TextureName, '') as textureName,
          m.DesignCode as designCode,
          m.ClientCode as clientCode,
          m.Photo1 as photo1
        FROM tblcollect_master m
        LEFT JOIN tblcollect_name n ON m.NameCode = n.NameCode
        LEFT JOIN tblcollect_category c ON m.CategoryCode = c.CategoryCode
        LEFT JOIN tblcollect_color cl ON m.ColorCode = cl.ColorCode
        LEFT JOIN tblcollect_material mt ON m.MaterialCode = mt.MaterialCode
        LEFT JOIN tblcollect_size s ON m.SizeCode = s.SizeCode
        LEFT JOIN tblcollect_texture t ON m.TextureCode = t.TextureCode
        WHERE 1=1
      `;
      const params: any[] = [];
      
      if (designCode) {
        sql += ` AND m.DesignCode = ?`;
        params.push(designCode);
      }
      
      if (query) {
        sql += ` AND (m.CollectCode LIKE ? OR m.ClientDescription LIKE ? OR m.ClientCode LIKE ?)`;
        params.push(`%${query}%`, `%${query}%`, `%${query}%`);
      }
      
      sql += ` ORDER BY m.ClientDescription ASC LIMIT ${parseInt(String(limit), 10)}`;
      
      const [rows] = await pool.query(sql, params);
      
      const products: ProductSearchResult[] = (rows as any[]).map((row: any) => ({
        id: row.id,
        productCode: row.productCode || '',
        productName: row.productName || '',
        categoryName: row.categoryName || '',
        colorName: row.colorName || '',
        materialName: row.materialName || '',
        sizeName: row.sizeName || '',
        textureName: row.textureName || '',
        designCode: row.designCode || '',
        clientCode: row.clientCode || '',
        photo1: row.photo1 || '',
      }));
      
      return {
        products,
        total: products.length,
      };
    } catch (error: any) {
      console.error('Error searching products from gayafusionall:', error);
      throw new AppError('Failed to search products', 500, 'PRODUCT_SEARCH_ERROR');
    }
  }

  /**
   * Get product by code
   */
  async getProductByCode(code: string) {
    const pool = getMySQLPool();
    
    if (!pool) {
      throw new AppError('MySQL connection not initialized', 500, 'MYSQL_NOT_INITIALIZED');
    }
    
    try {
      const [rows] = await pool.execute(
        `SELECT * FROM tblcollect_master WHERE product_code = ?`,
        [code]
      );
      
      if ((rows as any[]).length === 0) {
        throw new AppError('Product not found', 404, 'PRODUCT_NOT_FOUND');
      }
      
      const row = (rows as any[])[0];
      
      const product = {
        productCode: row.product_code,
        productName: row.product_name,
        color: row.color || '',
        texture: row.texture || '',
        material: row.material || '',
        size: row.size || '',
        finalSize: row.final_size || '',
        clayType: row.clay_type || '',
        clayQuantity: row.clay_quantity || 0,
        glaze: row.glaze || '',
        engobe: row.engobe || '',
        luster: row.luster || '',
        stainsOxides: row.stains_oxides || '',
        castingTools: row.casting_tools || '',
        extruders: row.extruders || '',
        textures: row.textures || '',
        generalTools: row.general_tools || '',
        buildNotes: row.build_notes || '',
      };
      
      return product;
    } catch (error: any) {
      console.error('Error getting product from gayafusionall:', error);
      throw new AppError('Failed to get product', 500, 'PRODUCT_GET_ERROR');
    }
  }

  /**
   * Get material requirements for a product
   */
  async getMaterialRequirements(code: string): Promise<MaterialRequirements | null> {
    const pool = getMySQLPool();
    
    if (!pool) {
      throw new AppError('MySQL connection not initialized', 500, 'MYSQL_NOT_INITIALIZED');
    }
    
    try {
      const [rows] = await pool.execute(
        `SELECT * FROM tblcollect_master WHERE product_code = ?`,
        [code]
      );
      
      if ((rows as any[]).length === 0) {
        return null;
      }
      
      const row = (rows as any[])[0];
      
      return {
        productCode: code,
        materials: {
          clay: row.clay_quantity > 0 
            ? [{ type: row.clay_type, quantity: row.clay_quantity }]
            : [],
          glazes: this.parseCSV(row.glaze),
          engobes: this.parseCSV(row.engobe),
          lusters: this.parseCSV(row.luster),
          stainsOxides: this.parseCSV(row.stains_oxides),
        },
      };
    } catch (error: any) {
      console.error('Error getting material requirements:', error);
      throw new AppError('Failed to get material requirements', 500, 'MATERIAL_REQ_ERROR');
    }
  }

  /**
   * Get tool requirements for a product
   */
  async getToolRequirements(code: string): Promise<ToolRequirements | null> {
    const pool = getMySQLPool();
    
    if (!pool) {
      throw new AppError('MySQL connection not initialized', 500, 'MYSQL_NOT_INITIALIZED');
    }
    
    try {
      const [rows] = await pool.execute(
        `SELECT * FROM tblcollect_master WHERE product_code = ?`,
        [code]
      );
      
      if ((rows as any[]).length === 0) {
        return null;
      }
      
      const row = (rows as any[])[0];
      
      return {
        productCode: code,
        tools: {
          castingTools: this.parseCSV(row.casting_tools),
          extruders: this.parseCSV(row.extruders),
          textures: this.parseCSV(row.textures),
          generalTools: this.parseCSV(row.general_tools),
        },
      };
    } catch (error: any) {
      console.error('Error getting tool requirements:', error);
      throw new AppError('Failed to get tool requirements', 500, 'TOOL_REQ_ERROR');
    }
  }

  /**
   * Get build notes for a product
   */
  async getBuildNotes(code: string): Promise<string | null> {
    const pool = getMySQLPool();
    
    if (!pool) {
      throw new AppError('MySQL connection not initialized', 500, 'MYSQL_NOT_INITIALIZED');
    }
    
    try {
      const [rows] = await pool.execute(
        `SELECT build_notes FROM tblcollect_master WHERE product_code = ?`,
        [code]
      );
      
      if ((rows as any[]).length === 0) {
        return null;
      }
      
      const row = (rows as any[])[0];
      return row.build_notes || '';
    } catch (error: any) {
      console.error('Error getting build notes:', error);
      throw new AppError('Failed to get build notes', 500, 'BUILD_NOTES_ERROR');
    }
  }

  /**
   * Parse comma-separated string to array
   */
  private parseCSV(value: string | null): string[] {
    if (!value) return [];
    return value.split(',').map(s => s.trim()).filter(s => s.length > 0);
  }
}

export const productService = new ProductService();
