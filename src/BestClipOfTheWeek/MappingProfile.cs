using AutoMapper;
using BestClipOfTheWeek.Models;
using BestClipOfTheWeek.Models.Terms;

namespace BestClipOfTheWeek
{
    public class MappingProfile : Profile
    {
        public MappingProfile()
        {
            CreateMap<Term, TermViewModel>()
                .ForMember(dest => dest.Term, opts => opts.MapFrom(src => src.Name));

            CreateMap<TermViewModel, Term>()
                .ForMember(dest => dest.Name, opts => opts.MapFrom(src => src.Term));
        }
    }
}
