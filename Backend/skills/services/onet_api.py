from skills.services.OnetWebService import OnetWebService

class OnetAPI:
    def __init__(self, api_key):
        self.client = OnetWebService(api_key)

    def get_soc_code(self, career_name, max_results=1):
        """
        Search O*NET for a career name and return the first SOC code.
        """
        response = self.client.call(
            'online/search',
            ('keyword', career_name),
            ('end', max_results)
        )

        occupations = response.get('occupation', [])
        if not occupations:
            return None

        return occupations[0]['code']  # e.g. "15-1252.00"

    def get_skills_for_soc(self, soc_code):
        """
        Fetch required skills for a given SOC code.
        """
        response = self.client.call(
            f'online/occupations/{soc_code}/details/skills'
        )

        elements = response.get('element', [])
        return [item['name'] for item in elements]

    def get_skills_for_career(self, career_name):
        """
        Full pipeline: career name → SOC code → skills
        """
        soc_code = self.get_soc_code(career_name)
        if not soc_code:
            return []

        return self.get_skills_for_soc(soc_code)
    
    def get_tools_for_soc(self, soc_code):
        response = self.client.call(
            f'online/occupations/{soc_code}/details/technology'
        )
        elements = response.get('element', [])
        return [item['name'] for item in elements]

    def get_tools_for_career(self, career_name):
        soc_code = self.get_soc_code(career_name)
        if not soc_code:
            return []
        return self.get_tools_for_soc(soc_code)