"""
Customer Data Service

Управление данными клиентов ваших клиентов (Level 3 isolation)
- CRUD operations
- Qualification tracking
- Custom fields management
- Memory integration
"""

import asyncpg
import os
from typing import Dict, Any, Optional, List
from datetime import datetime
import logging

logger = logging.getLogger(__name__)


class CustomerDataService:
    """Service for managing customer data with multi-tenant isolation"""

    def __init__(self, db_url: Optional[str] = None):
        self.db_url = db_url or os.getenv("DATABASE_URL")

    async def _get_connection(self):
        """Get database connection"""
        return await asyncpg.connect(self.db_url)

    async def create_or_update_customer(
        self,
        tenant_id: str,
        agent_id: str,
        customer_id: str,
        data: Dict[str, Any]
    ) -> Dict[str, Any]:
        """
        Create or update customer data

        Args:
            tenant_id: Tenant ID
            agent_id: Agent ID
            customer_id: Customer external ID (phone, email, etc)
            data: Customer data dict

        Returns:
            Customer record
        """
        conn = await self._get_connection()

        try:
            # Set tenant context for RLS
            await conn.execute(f"SET app.current_tenant = '{tenant_id}'")

            # Upsert customer data
            query = """
            INSERT INTO customer_data (
                tenant_id,
                agent_id,
                customer_id,
                name,
                email,
                phone,
                company,
                customer_type,
                qualification_status,
                qualification_score,
                qualification_data,
                tags,
                custom_fields,
                notes,
                source,
                metadata,
                last_contact_at
            ) VALUES (
                $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, NOW()
            )
            ON CONFLICT (tenant_id, agent_id, customer_id)
            DO UPDATE SET
                name = COALESCE(EXCLUDED.name, customer_data.name),
                email = COALESCE(EXCLUDED.email, customer_data.email),
                phone = COALESCE(EXCLUDED.phone, customer_data.phone),
                company = COALESCE(EXCLUDED.company, customer_data.company),
                customer_type = COALESCE(EXCLUDED.customer_type, customer_data.customer_type),
                qualification_status = COALESCE(EXCLUDED.qualification_status, customer_data.qualification_status),
                qualification_score = COALESCE(EXCLUDED.qualification_score, customer_data.qualification_score),
                qualification_data = COALESCE(EXCLUDED.qualification_data, customer_data.qualification_data),
                tags = COALESCE(EXCLUDED.tags, customer_data.tags),
                custom_fields = customer_data.custom_fields || EXCLUDED.custom_fields,
                notes = COALESCE(EXCLUDED.notes, customer_data.notes),
                source = COALESCE(EXCLUDED.source, customer_data.source),
                metadata = customer_data.metadata || EXCLUDED.metadata,
                last_contact_at = NOW(),
                updated_at = NOW()
            RETURNING *
            """

            row = await conn.fetchrow(
                query,
                tenant_id,
                agent_id,
                customer_id,
                data.get('name'),
                data.get('email'),
                data.get('phone'),
                data.get('company'),
                data.get('customer_type', 'lead'),
                data.get('qualification_status', 'not_qualified'),
                data.get('qualification_score'),
                data.get('qualification_data', {}),
                data.get('tags', []),
                data.get('custom_fields', {}),
                data.get('notes'),
                data.get('source', 'unknown'),
                data.get('metadata', {})
            )

            logger.info(f"[CustomerData] Upserted customer {customer_id} for tenant {tenant_id}")

            return dict(row) if row else {}

        finally:
            await conn.close()

    async def get_customer(
        self,
        tenant_id: str,
        agent_id: str,
        customer_id: str
    ) -> Optional[Dict[str, Any]]:
        """
        Get customer data

        Args:
            tenant_id: Tenant ID
            agent_id: Agent ID
            customer_id: Customer external ID

        Returns:
            Customer record or None
        """
        conn = await self._get_connection()

        try:
            await conn.execute(f"SET app.current_tenant = '{tenant_id}'")

            query = """
            SELECT * FROM customer_data
            WHERE tenant_id = $1 AND agent_id = $2 AND customer_id = $3
            """

            row = await conn.fetchrow(query, tenant_id, agent_id, customer_id)

            if row:
                logger.info(f"[CustomerData] Found customer {customer_id}")
                return dict(row)

            logger.warning(f"[CustomerData] Customer {customer_id} not found")
            return None

        finally:
            await conn.close()

    async def list_customers(
        self,
        tenant_id: str,
        agent_id: str,
        customer_type: Optional[str] = None,
        qualification_status: Optional[str] = None,
        limit: int = 100
    ) -> List[Dict[str, Any]]:
        """
        List customers with filters

        Args:
            tenant_id: Tenant ID
            agent_id: Agent ID
            customer_type: Filter by type (lead, prospect, customer)
            qualification_status: Filter by qualification
            limit: Max results

        Returns:
            List of customer records
        """
        conn = await self._get_connection()

        try:
            await conn.execute(f"SET app.current_tenant = '{tenant_id}'")

            query = """
            SELECT * FROM customer_data
            WHERE tenant_id = $1 AND agent_id = $2
            """
            params = [tenant_id, agent_id]

            if customer_type:
                query += f" AND customer_type = ${len(params) + 1}"
                params.append(customer_type)

            if qualification_status:
                query += f" AND qualification_status = ${len(params) + 1}"
                params.append(qualification_status)

            query += f" ORDER BY last_contact_at DESC LIMIT ${len(params) + 1}"
            params.append(limit)

            rows = await conn.fetch(query, *params)

            logger.info(f"[CustomerData] Found {len(rows)} customers for agent {agent_id}")

            return [dict(row) for row in rows]

        finally:
            await conn.close()

    async def update_qualification(
        self,
        tenant_id: str,
        agent_id: str,
        customer_id: str,
        status: str,
        score: Optional[int] = None,
        data: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """
        Update customer qualification

        Args:
            tenant_id: Tenant ID
            agent_id: Agent ID
            customer_id: Customer external ID
            status: Qualification status
            score: Qualification score (0-100)
            data: Qualification data (answers)

        Returns:
            Updated customer record
        """
        conn = await self._get_connection()

        try:
            await conn.execute(f"SET app.current_tenant = '{tenant_id}'")

            query = """
            UPDATE customer_data
            SET
                qualification_status = $1,
                qualification_score = COALESCE($2, qualification_score),
                qualification_data = COALESCE($3, qualification_data),
                updated_at = NOW()
            WHERE tenant_id = $4 AND agent_id = $5 AND customer_id = $6
            RETURNING *
            """

            row = await conn.fetchrow(
                query,
                status,
                score,
                data or {},
                tenant_id,
                agent_id,
                customer_id
            )

            if row:
                logger.info(f"[CustomerData] Updated qualification for {customer_id}: {status}")
                return dict(row)

            logger.warning(f"[CustomerData] Customer {customer_id} not found for update")
            return {}

        finally:
            await conn.close()

    async def add_note(
        self,
        tenant_id: str,
        agent_id: str,
        customer_id: str,
        note: str
    ) -> Dict[str, Any]:
        """
        Add note to customer

        Args:
            tenant_id: Tenant ID
            agent_id: Agent ID
            customer_id: Customer external ID
            note: Note text

        Returns:
            Updated customer record
        """
        conn = await self._get_connection()

        try:
            await conn.execute(f"SET app.current_tenant = '{tenant_id}'")

            query = """
            UPDATE customer_data
            SET
                notes = COALESCE(notes || E'\n\n', '') || $1,
                updated_at = NOW()
            WHERE tenant_id = $2 AND agent_id = $3 AND customer_id = $4
            RETURNING *
            """

            row = await conn.fetchrow(query, note, tenant_id, agent_id, customer_id)

            if row:
                logger.info(f"[CustomerData] Added note for {customer_id}")
                return dict(row)

            return {}

        finally:
            await conn.close()

    async def add_tags(
        self,
        tenant_id: str,
        agent_id: str,
        customer_id: str,
        tags: List[str]
    ) -> Dict[str, Any]:
        """
        Add tags to customer

        Args:
            tenant_id: Tenant ID
            agent_id: Agent ID
            customer_id: Customer external ID
            tags: List of tags to add

        Returns:
            Updated customer record
        """
        conn = await self._get_connection()

        try:
            await conn.execute(f"SET app.current_tenant = '{tenant_id}'")

            query = """
            UPDATE customer_data
            SET
                tags = array(SELECT DISTINCT unnest(tags || $1::text[])),
                updated_at = NOW()
            WHERE tenant_id = $2 AND agent_id = $3 AND customer_id = $4
            RETURNING *
            """

            row = await conn.fetchrow(query, tags, tenant_id, agent_id, customer_id)

            if row:
                logger.info(f"[CustomerData] Added tags {tags} for {customer_id}")
                return dict(row)

            return {}

        finally:
            await conn.close()

    async def get_stats(
        self,
        tenant_id: str,
        agent_id: str
    ) -> Dict[str, Any]:
        """
        Get customer statistics for agent

        Args:
            tenant_id: Tenant ID
            agent_id: Agent ID

        Returns:
            Statistics dict
        """
        conn = await self._get_connection()

        try:
            await conn.execute(f"SET app.current_tenant = '{tenant_id}'")

            query = """
            SELECT
                COUNT(*) as total_customers,
                COUNT(*) FILTER (WHERE customer_type = 'lead') as leads,
                COUNT(*) FILTER (WHERE customer_type = 'prospect') as prospects,
                COUNT(*) FILTER (WHERE customer_type = 'customer') as customers,
                COUNT(*) FILTER (WHERE qualification_status = 'qualified') as qualified,
                COUNT(*) FILTER (WHERE qualification_status = 'disqualified') as disqualified,
                AVG(qualification_score) FILTER (WHERE qualification_score IS NOT NULL) as avg_qualification_score
            FROM customer_data
            WHERE tenant_id = $1 AND agent_id = $2
            """

            row = await conn.fetchrow(query, tenant_id, agent_id)

            logger.info(f"[CustomerData] Retrieved stats for agent {agent_id}")

            return dict(row) if row else {}

        finally:
            await conn.close()


# Singleton instance
_customer_service = None


def get_customer_service() -> CustomerDataService:
    """Get singleton customer service instance"""
    global _customer_service
    if _customer_service is None:
        _customer_service = CustomerDataService()
    return _customer_service


# Example usage
if __name__ == "__main__":
    """
    Test Customer Data Service

    Prerequisites:
    - DATABASE_URL set in .env.local
    - Database initialized with schema_extended.sql
    """

    import asyncio

    async def test_customer_service():
        service = get_customer_service()

        tenant_id = "test-tenant-123"
        agent_id = "test-agent-456"
        customer_id = "+1234567890"

        print("=== Testing Customer Data Service ===\n")

        # Test 1: Create customer
        print("1. Creating customer...")
        customer = await service.create_or_update_customer(
            tenant_id=tenant_id,
            agent_id=agent_id,
            customer_id=customer_id,
            data={
                "name": "John Doe",
                "email": "john@example.com",
                "phone": "+1234567890",
                "company": "Acme Inc",
                "source": "whatsapp",
                "custom_fields": {
                    "industry": "SaaS",
                    "employees": "50"
                }
            }
        )
        print(f"Created: {customer['name']} ({customer['customer_type']})\n")

        # Test 2: Update qualification
        print("2. Updating qualification...")
        customer = await service.update_qualification(
            tenant_id=tenant_id,
            agent_id=agent_id,
            customer_id=customer_id,
            status="qualified",
            score=85,
            data={
                "company_size": "50",
                "budget": "$10k/month",
                "timeline": "Q1 2024"
            }
        )
        print(f"Qualification: {customer['qualification_status']} (score: {customer['qualification_score']})\n")

        # Test 3: Add tags
        print("3. Adding tags...")
        customer = await service.add_tags(
            tenant_id=tenant_id,
            agent_id=agent_id,
            customer_id=customer_id,
            tags=["hot-lead", "enterprise", "q1-2024"]
        )
        print(f"Tags: {customer['tags']}\n")

        # Test 4: Add note
        print("4. Adding note...")
        await service.add_note(
            tenant_id=tenant_id,
            agent_id=agent_id,
            customer_id=customer_id,
            note="Very interested in our enterprise plan. Follow up next week."
        )
        print("Note added\n")

        # Test 5: Get customer
        print("5. Retrieving customer...")
        customer = await service.get_customer(
            tenant_id=tenant_id,
            agent_id=agent_id,
            customer_id=customer_id
        )
        print(f"Found: {customer['name']}")
        print(f"Email: {customer['email']}")
        print(f"Company: {customer['company']}")
        print(f"Qualification: {customer['qualification_status']} ({customer['qualification_score']}/100)")
        print(f"Tags: {customer['tags']}\n")

        # Test 6: Get stats
        print("6. Getting stats...")
        stats = await service.get_stats(
            tenant_id=tenant_id,
            agent_id=agent_id
        )
        print(f"Total customers: {stats['total_customers']}")
        print(f"Leads: {stats['leads']}")
        print(f"Prospects: {stats['prospects']}")
        print(f"Qualified: {stats['qualified']}")
        print(f"Avg qualification score: {stats['avg_qualification_score']:.1f}")

    asyncio.run(test_customer_service())
