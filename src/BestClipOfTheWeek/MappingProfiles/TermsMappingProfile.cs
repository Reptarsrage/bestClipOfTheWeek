using AutoMapper;

namespace BestClipOfTheWeek
{
    public class MappingProfile : Profile
    {
        public MappingProfile()
        {
            CreateMap<Models.Term, Models.Dto.Term>();

            CreateMap<Models.Dto.Term, Models.Term>();
        }
    }
}
