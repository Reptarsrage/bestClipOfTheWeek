using Moq;
using System;
using System.Collections.Generic;

namespace BestClipOfTheWeek.Tests.Unit
{
    public abstract class UnitTestBase
    {
        private readonly IDictionary<Type, Mock> _the;

        protected UnitTestBase()
        {
            _the = new Dictionary<Type, Mock>();
        }

        protected Mock<T> The<T>() where T : class
        {
            if (!_the.ContainsKey(typeof(T)))
            {
                _the[typeof(T)] = new Mock<T>();
            }

            return (Mock<T>)_the[typeof(T)];
        }

        protected void VerifyAll()
        {
            foreach (var mockedType in _the.Keys)
            {
                _the[mockedType].VerifyAll();
            }
        }
    }
}
