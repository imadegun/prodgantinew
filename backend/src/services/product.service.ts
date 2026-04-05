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

/**
 * Extended product info from tblcollect_master including production-specific fields
 */
interface ProductProductionInfo {
  productCode: string;
  // Build Technique
  buildTech: string | null;
  buildTechNote: string | null;
  // Clay info
  clayId: number | null;
  clayCode: string | null;
  clayDescription: string | null;
  clayKG: number | null;
  clayNote: string | null;
  // Luster info
  hasLuster: boolean;
  lustre1: { id: number; code: string; description: string } | null;
  lustre2: { id: number; code: string; description: string } | null;
  lustre3: { id: number; code: string; description: string } | null;
  lustre4: { id: number; code: string; description: string } | null;
  lustreTemp: number | null;
  // Firing info
  firing: string | null;
  firingNote: string | null;
  // Glaze info
  glaze1: { id: number; code: string; description: string } | null;
  glaze2: { id: number; code: string; description: string } | null;
  glaze3: { id: number; code: string; description: string } | null;
  glaze4: { id: number; code: string; description: string } | null;
  glazeTemp: number | null;
  // Engobe info
  engobe1: { id: number; code: string; description: string } | null;
  engobe2: { id: number; code: string; description: string } | null;
  engobe3: { id: number; code: string; description: string } | null;
  engobe4: { id: number; code: string; description: string } | null;
  // Size info
  width: number | null;
  height: number | null;
  length: number | null;
  diameter: number | null;
}

/**
 * Determine production workflow based on product specs
 */
export interface ProductionWorkflow {
  // Workflow type based on BuildTech
  workflowType: 'THROWING' | 'HANDBUILD' | 'SLAB';
  // Whether to skip High Firing (for Raku clay)
  skipHighFiring: boolean;
  // Whether to include Luster Firing stages
  hasLusterFiring: boolean;
  // Firing type
  firingType: string | null;
  // Summary for display
  summary: string;
  // All applicable stages for this product
  stages: string[];
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
          c.CategoryName as productName,
          c.CategoryName as categoryName,
          COALESCE(cl.ColorName, '') as colorName,
          COALESCE(mt.MaterialName, '') as materialName,
          COALESCE(s.SizeName, '') as sizeName,
          COALESCE(t.TextureName, '') as textureName,
          m.DesignCode as designCode,
          m.ClientCode as clientCode,
          m.Photo1 as photo1
        FROM tblcollect_master m
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
        `SELECT 
          m.ID as id,
          m.CollectCode as productCode,
          c.CategoryName as productName,
          COALESCE(cl.ColorName, '') as color,
          COALESCE(mt.MaterialName, '') as material,
          COALESCE(s.SizeName, '') as size,
          m.Clay as clayId,
          clay.ClayCode as clayCode,
          clay.ClayDescription as clayDescription,
          m.ClayKG as clayKG,
          m.BuildTech as buildTech,
          m.BuildTechNote as buildTechNote,
          m.Firing as firing,
          m.FiringNote as firingNote
       FROM tblcollect_master m
       LEFT JOIN tblcollect_category c ON m.CategoryCode = c.CategoryCode
       LEFT JOIN tblcollect_material mt ON m.MaterialCode = mt.MaterialCode
       LEFT JOIN tblcollect_size s ON m.SizeCode = s.SizeCode
       LEFT JOIN tblclay clay ON m.Clay = clay.ID
       WHERE m.CollectCode = ?`,
        [code]
      );
      
      if ((rows as any[]).length === 0) {
        throw new AppError('Product not found', 404, 'PRODUCT_NOT_FOUND');
      }
      
      const row = (rows as any[])[0];
      
      const product = {
        productCode: row.productCode,
        productName: row.productName,
        color: row.color || '',
        texture: row.texture || '',
        material: row.material || '',
        size: row.size || '',
        finalSize: row.finalSize || '',
        clayType: row.clayDescription || '',
        clayQuantity: row.clayKG || 0,
        glaze: row.glaze || '',
        engobe: row.engobe || '',
        luster: row.lustre || '',
        stainsOxides: row.stainOxide || '',
        castingTools: row.castingTools || '',
        extruders: row.extruders || '',
        textures: row.textures || '',
        generalTools: row.tools || '',
        buildNotes: row.buildTechNote || '',
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

/**
 * Get production info for a product from tblcollect_master
 * Includes BuildTech, Clay, Luster, and other production-specific fields
 *
 * IMPORTANT: PostgreSQL productCode maps to MySQL ClientCode, NOT CollectCode
 */
async getProductProductionInfo(code: string): Promise<ProductProductionInfo | null> {
  const pool = getMySQLPool();
  
  if (!pool) {
    throw new AppError('MySQL connection not initialized', 500, 'MYSQL_NOT_INITIALIZED');
  }
  
  try {
    console.log(`[getProductProductionInfo] Looking up productCode: "${code}" in MySQL tblcollect_master`);
    
    // FIRST try exact match on ClientCode (this is what PostgreSQL productCode maps to)
    const [rows] = await pool.execute(
      `SELECT
        m.CollectCode as productCode,
        m.BuildTech as buildTech,
        m.BuildTechNote as buildTechNote,
        m.Clay as clayId,
        c.ClayCode as clayCode,
        c.ClayDescription as clayDescription,
        m.ClayKG as clayKG,
        m.ClayNote as clayNote,
        m.Lustre1 as lustre1,
        m.Lustre2 as lustre2,
        m.Lustre3 as lustre3,
        m.Lustre4 as lustre4,
        m.LustreTemp as lustreTemp,
        m.Firing as firing,
        m.FiringNote as firingNote,
        m.Glaze1 as glaze1,
        m.Glaze2 as glaze2,
        m.Glaze3 as glaze3,
        m.Glaze4 as glaze4,
        m.GlazeTemp as glazeTemp,
        m.Engobe1 as engobe1,
        m.Engobe2 as engobe2,
        m.Engobe3 as engobe3,
        m.Engobe4 as engobe4,
        m.Width as width,
        m.Height as height,
        m.Length as length,
        m.Diameter as diameter,
        m.ClientCode as clientCode
       FROM tblcollect_master m
       LEFT JOIN tblclay c ON m.Clay = c.ID
       WHERE m.ClientCode = ?`,
      [code]
    );
    
    console.log(`[getProductProductionInfo] ClientCode match query returned ${(rows as any[]).length} rows for ClientCode="${code}"`);
    
    if ((rows as any[]).length === 0) {
      // Fallback: try CollectCode match
      console.log(`[getProductProductionInfo] No ClientCode match found. Trying CollectCode...`);
      
      const [collectRows] = await pool.execute(
        `SELECT
          m.CollectCode as productCode,
          m.BuildTech as buildTech,
          m.BuildTechNote as buildTechNote,
          m.Clay as clayId,
          c.ClayCode as clayCode,
          c.ClayDescription as clayDescription,
          m.ClayKG as clayKG,
          m.ClayNote as clayNote,
          m.Lustre1 as lustre1,
          m.Lustre2 as lustre2,
          m.Lustre3 as lustre3,
          m.Lustre4 as lustre4,
          m.LustreTemp as lustreTemp,
          m.Firing as firing,
          m.FiringNote as firingNote,
          m.Glaze1 as glaze1,
          m.Glaze2 as glaze2,
          m.Glaze3 as glaze3,
          m.Glaze4 as glaze4,
          m.GlazeTemp as glazeTemp,
          m.Engobe1 as engobe1,
          m.Engobe2 as engobe2,
          m.Engobe3 as engobe3,
          m.Engobe4 as engobe4,
          m.Width as width,
          m.Height as height,
          m.Length as length,
          m.Diameter as diameter,
          m.ClientCode as clientCode
         FROM tblcollect_master m
         LEFT JOIN tblclay c ON m.Clay = c.ID
         WHERE m.CollectCode = ?`,
        [code]
      );
      
      console.log(`[getProductProductionInfo] CollectCode match query returned ${(collectRows as any[]).length} rows for CollectCode="${code}"`);
      
      if ((collectRows as any[]).length === 0) {
        // Last resort: LIKE search on all fields
        console.log(`[getProductProductionInfo] No CollectCode match found. Trying LIKE search...`);
        
        const [searchRows] = await pool.execute(
          `SELECT
            m.CollectCode as productCode,
            m.BuildTech as buildTech,
            m.BuildTechNote as buildTechNote,
            m.Clay as clayId,
            c.ClayCode as clayCode,
            c.ClayDescription as clayDescription,
            m.ClayKG as clayKG,
            m.ClayNote as clayNote,
            m.Lustre1 as lustre1,
            m.Lustre2 as lustre2,
            m.Lustre3 as lustre3,
            m.Lustre4 as lustre4,
            m.LustreTemp as lustreTemp,
            m.Firing as firing,
            m.FiringNote as firingNote,
            m.Glaze1 as glaze1,
            m.Glaze2 as glaze2,
            m.Glaze3 as glaze3,
            m.Glaze4 as glaze4,
            m.GlazeTemp as glazeTemp,
            m.Engobe1 as engobe1,
            m.Engobe2 as engobe2,
            m.Engobe3 as engobe3,
            m.Engobe4 as engobe4,
            m.Width as width,
            m.Height as height,
            m.Length as length,
            m.Diameter as diameter,
            m.ClientDescription as clientDescription,
            m.ClientCode as clientCode
           FROM tblcollect_master m
           LEFT JOIN tblclay c ON m.Clay = c.ID
           WHERE m.ClientCode LIKE ? OR m.CollectCode LIKE ? OR m.ClientDescription LIKE ?
           LIMIT 10`,
          [`%${code}%`, `%${code}%`, `%${code}%`]
        );
        
        console.log(`[getProductProductionInfo] LIKE search returned ${(searchRows as any[]).length} rows`);
        
        if ((searchRows as any[]).length > 0) {
          console.log(`[getProductProductionInfo] Found similar products:`, (searchRows as any[]).map((r: any) => ({
            CollectCode: r.productCode,
            ClientCode: r.clientCode,
            BuildTech: r.buildTech
          })));
          
          // Use the first match
          const row = (searchRows as any[])[0];
          console.log(`[getProductProductionInfo] Using LIKE match: CollectCode="${row.productCode}", ClientCode="${row.clientCode}", BuildTech="${row.buildTech}"`);
          
          // Process and return the row (same as below)
          return this._processProductRow(row, pool);
        }
        
        return null;
      }
      
      // Use CollectCode match
      const row = (collectRows as any[])[0];
      console.log(`[getProductProductionInfo] Using CollectCode match: CollectCode="${row.productCode}", ClientCode="${row.clientCode}", BuildTech="${row.buildTech}"`);
      return this._processProductRow(row, pool);
    }
    
    // Use ClientCode match
    const row = (rows as any[])[0];
    console.log(`[getProductProductionInfo] Using ClientCode match: CollectCode="${row.productCode}", ClientCode="${row.clientCode}", BuildTech="${row.buildTech}"`);
    return this._processProductRow(row, pool);
  } catch (error: any) {
    console.error('Error getting production info from gayafusionall:', error);
    throw new AppError('Failed to get production info', 500, 'PRODUCTION_INFO_ERROR');
  }
}

/**
 * Helper to process a product row into ProductProductionInfo
 */
private async _processProductRow(row: any, pool: any): Promise<ProductProductionInfo> {
  // Check if product has luster (any lustre field is not null)
  const hasLuster = row.lustre1 || row.lustre2 || row.lustre3 || row.lustre4;
  
  // Helper to get luster/glaze/engobe details
  const getDetail = async (id: number, tableName: string) => {
    if (!id) return null;
    const [detailRows] = await pool.execute(
      `SELECT ID as id, ${tableName}Code as code, ${tableName}Description as description FROM tbl${tableName} WHERE ID = ?`,
      [id]
    );
    return (detailRows as any[])[0] || null;
  };
  
  // Get luster details
  const luster1 = row.lustre1 ? await getDetail(row.lustre1, 'lustre') : null;
  const luster2 = row.lustre2 ? await getDetail(row.lustre2, 'lustre') : null;
  const luster3 = row.lustre3 ? await getDetail(row.lustre3, 'lustre') : null;
  const luster4 = row.lustre4 ? await getDetail(row.lustre4, 'lustre') : null;
  
  // Get glaze details
  const glaze1 = row.glaze1 ? await getDetail(row.glaze1, 'glaze') : null;
  const glaze2 = row.glaze2 ? await getDetail(row.glaze2, 'glaze') : null;
  const glaze3 = row.glaze3 ? await getDetail(row.glaze3, 'glaze') : null;
  const glaze4 = row.glaze4 ? await getDetail(row.glaze4, 'glaze') : null;
  
  // Get engobe details
  const engobe1 = row.engobe1 ? await getDetail(row.engobe1, 'engobe') : null;
  const engobe2 = row.engobe2 ? await getDetail(row.engobe2, 'engobe') : null;
  const engobe3 = row.engobe3 ? await getDetail(row.engobe3, 'engobe') : null;
  const engobe4 = row.engobe4 ? await getDetail(row.engobe4, 'engobe') : null;
  
  return {
    productCode: row.productCode,
    buildTech: row.buildTech,
    buildTechNote: row.buildTechNote,
    clayId: row.clayId,
    clayCode: row.clayCode,
    clayDescription: row.clayDescription,
    clayKG: row.clayKG,
    clayNote: row.clayNote,
    hasLuster,
    lustre1: luster1,
    lustre2: luster2,
    lustre3: luster3,
    lustre4: luster4,
    lustreTemp: row.lustreTemp,
    firing: row.firing,
    firingNote: row.firingNote,
    glaze1,
    glaze2,
    glaze3,
    glaze4,
    glazeTemp: row.glazeTemp,
    engobe1,
    engobe2,
    engobe3,
    engobe4,
    width: row.width,
    height: row.height,
    length: row.length,
    diameter: row.diameter,
  };
}

/**
 * Determine production workflow based on product specifications
 * This analyzes BuildTech, Clay type, and Luster requirements
 */
async getProductionWorkflow(code: string): Promise<ProductionWorkflow | null> {
  const pool = getMySQLPool();
  
  if (!pool) {
    throw new AppError('MySQL connection not initialized', 500, 'MYSQL_NOT_INITIALIZED');
  }
  
  try {
    console.log(`[getProductionWorkflow] Looking up productCode: "${code}" in MySQL tblcollect_master`);
    
    // FIRST try exact match on ClientCode (this is what PostgreSQL productCode maps to)
    const [rows] = await pool.execute(
      `SELECT
        m.CollectCode as productCode,
        m.BuildTech as buildTech,
        c.ClayCode as clayCode,
        m.Lustre1 as lustre1,
        m.Lustre2 as lustre2,
        m.Lustre3 as lustre3,
        m.Lustre4 as lustre4,
        m.Firing as firing,
        m.ClientCode as clientCode
       FROM tblcollect_master m
       LEFT JOIN tblclay c ON m.Clay = c.ID
       WHERE m.ClientCode = ?`,
      [code]
    );
    
    console.log(`[getProductionWorkflow] ClientCode match query returned ${(rows as any[]).length} rows for ClientCode="${code}"`);
    
    if ((rows as any[]).length === 0) {
      // Fallback: try CollectCode match
      console.log(`[getProductionWorkflow] No ClientCode match found. Trying CollectCode...`);
      
      const [collectRows] = await pool.execute(
        `SELECT
          m.CollectCode as productCode,
          m.BuildTech as buildTech,
          c.ClayCode as clayCode,
          m.Lustre1 as lustre1,
          m.Lustre2 as lustre2,
          m.Lustre3 as lustre3,
          m.Lustre4 as lustre4,
          m.Firing as firing,
          m.ClientCode as clientCode
         FROM tblcollect_master m
         LEFT JOIN tblclay c ON m.Clay = c.ID
         WHERE m.CollectCode = ?`,
        [code]
      );
      
      console.log(`[getProductionWorkflow] CollectCode match query returned ${(collectRows as any[]).length} rows for CollectCode="${code}"`);
      
      if ((collectRows as any[]).length === 0) {
        return null;
      }
      
      const row = (collectRows as any[])[0];
      console.log(`[getProductionWorkflow] Using CollectCode match: CollectCode="${row.productCode}", ClientCode="${row.clientCode}", BuildTech="${row.buildTech}"`);
      
      // Process the row
      const buildTech = row.buildTech?.toUpperCase() || '';
      let workflowType: 'THROWING' | 'HANDBUILD' | 'SLAB' = 'THROWING';
      
      if (buildTech.includes('HANDBUILD') || buildTech.includes('HAND BUILD') || buildTech.includes('HANDMADE') || buildTech.includes('HAND MADE')) {
        workflowType = 'HANDBUILD';
      } else if (buildTech.includes('SLAB') || buildTech.includes('SLABING') || buildTech.includes('SLAB & ESTRUDER') || buildTech.includes('SLAB TRAY')) {
        workflowType = 'SLAB';
      }
      
      const clayCode = row.clayCode?.toUpperCase() || '';
      const skipHighFiring = clayCode.includes('RAKU');
      const hasLuster = row.lustre1 || row.lustre2 || row.lustre3 || row.lustre4;
      
      const allStages = [
        'THROWING', 'TRIMMING', 'DECORATION', 'DRYING',
        'LOAD_BISQUE', 'OUT_BISQUE', 'LOAD_HIGH_FIRING', 'OUT_HIGH_FIRING',
        'LOAD_RAKU_FIRING', 'OUT_RAKU_FIRING', 'LOAD_LUSTER_FIRING', 'OUT_LUSTER_FIRING',
        'SANDING', 'WAXING', 'DIPPING', 'SPRAYING', 'COLOR_DECORATION',
        'QC_GOOD', 'QC_REJECT', 'QC_RE_FIRING', 'QC_SECOND',
      ];
      
      let stages = [...allStages];
      if (workflowType === 'HANDBUILD' || workflowType === 'SLAB') {
        stages = stages.filter(s => s !== 'THROWING' && s !== 'TRIMMING');
      }
      if (skipHighFiring) {
        stages = stages.filter(s => s !== 'LOAD_HIGH_FIRING' && s !== 'OUT_HIGH_FIRING');
      }
      if (!hasLuster) {
        stages = stages.filter(s => s !== 'LOAD_LUSTER_FIRING' && s !== 'OUT_LUSTER_FIRING');
      }
      
      const summaryParts: string[] = [];
      summaryParts.push(`Workflow: ${workflowType}`);
      if (skipHighFiring) summaryParts.push('Skip High Firing (Raku clay)');
      if (hasLuster) summaryParts.push('Includes Luster Firing');
      
      return {
        workflowType,
        skipHighFiring,
        hasLusterFiring: hasLuster,
        firingType: row.firing,
        summary: summaryParts.join(' | '),
        stages,
      };
    }
    
    const row = (rows as any[])[0];
    console.log(`[getProductionWorkflow] Using ClientCode match: CollectCode="${row.productCode}", ClientCode="${row.clientCode}", BuildTech="${row.buildTech}"`);
    
    // Process the row using the same logic as CollectCode match
    const buildTech = row.buildTech?.toUpperCase() || '';
    let workflowType: 'THROWING' | 'HANDBUILD' | 'SLAB' = 'THROWING';
    
    if (buildTech.includes('HANDBUILD') || buildTech.includes('HAND BUILD') || buildTech.includes('HANDMADE') || buildTech.includes('HAND MADE')) {
      workflowType = 'HANDBUILD';
    } else if (buildTech.includes('SLAB') || buildTech.includes('SLABING') || buildTech.includes('SLAB & ESTRUDER') || buildTech.includes('SLAB TRAY')) {
      workflowType = 'SLAB';
    }
    
    const clayCode = row.clayCode?.toUpperCase() || '';
    const skipHighFiring = clayCode.includes('RAKU');
    const hasLuster = row.lustre1 || row.lustre2 || row.lustre3 || row.lustre4;
    
    const allStages = [
      'THROWING', 'TRIMMING', 'DECORATION', 'DRYING',
      'LOAD_BISQUE', 'OUT_BISQUE', 'LOAD_HIGH_FIRING', 'OUT_HIGH_FIRING',
      'LOAD_RAKU_FIRING', 'OUT_RAKU_FIRING', 'LOAD_LUSTER_FIRING', 'OUT_LUSTER_FIRING',
      'SANDING', 'WAXING', 'DIPPING', 'SPRAYING', 'COLOR_DECORATION',
      'QC_GOOD', 'QC_REJECT', 'QC_RE_FIRING', 'QC_SECOND',
    ];
    
    let stages = [...allStages];
    if (workflowType === 'HANDBUILD' || workflowType === 'SLAB') {
      stages = stages.filter(s => s !== 'THROWING' && s !== 'TRIMMING');
    }
    if (skipHighFiring) {
      stages = stages.filter(s => s !== 'LOAD_HIGH_FIRING' && s !== 'OUT_HIGH_FIRING');
    }
    if (!hasLuster) {
      stages = stages.filter(s => s !== 'LOAD_LUSTER_FIRING' && s !== 'OUT_LUSTER_FIRING');
    }
    
    const summaryParts: string[] = [];
    summaryParts.push(`Workflow: ${workflowType}`);
    if (skipHighFiring) summaryParts.push('Skip High Firing (Raku clay)');
    if (hasLuster) summaryParts.push('Includes Luster Firing');
    
    return {
      workflowType,
      skipHighFiring,
      hasLusterFiring: hasLuster,
      firingType: row.firing,
      summary: summaryParts.join(' | '),
      stages,
    };
  } catch (error: any) {
    console.error('Error determining production workflow:', error);
    throw new AppError('Failed to determine production workflow', 500, 'WORKFLOW_ERROR');
  }
}
}

export const productService = new ProductService();
